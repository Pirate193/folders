import { create } from "zustand";
import { createClient } from "@/lib/client";

export type SubscriptionTier = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' ;

export interface Subscription {
    id:string;
    user_id:string;
    tier:SubscriptionTier;
    status:SubscriptionStatus;
    amount:number;
    currency:string;
    paystack_reference:string |null;
    paystack_subscription_code:string |null;
    paystack_customer_code:string|null;
    start_date:string;
    end_date:string;
    auto_renew:boolean;
    created_at:string;
    updated_at:string;
}

export interface PaymentTransaction{
    id:string;
    user_id:string;
    subscription_id:string;
    amount:number;
    currency:string;
    status:'pending'|'success'|'failed'|'cancelled';
    paystack_reference:string |null;
    paystack_access_code:string |null;
    payment_method:string |null;
    metadate:any;
    created_at:string;
    updated_at:string;
}

interface SubscriptionState{
    subscription:Subscription|null;
    transactions:PaymentTransaction[];
    isLoading:boolean;
    error:string | null;

    fetchSubscription:()=>Promise<void>;
    fetchTransactions:()=>Promise<void>;
    initializePayment:(plan:'monthly' |'yearly')=>Promise<{authorization_url:string,reference:string}| null>;
    verifyPayment:(reference:string)=>Promise<boolean>;
    cancelSubscription:()=>Promise<void>;
    isPro:()=>boolean;
    canUseFeature:(feature:string)=>boolean;
    clearError:()=>void;
}

export const useSubscriptionStore = create<SubscriptionState>((set,get)=>({
    subscription:null,
    transactions:[],
    isLoading:false,
    error:null,

    fetchSubscription:async()=>{
        set({isLoading:true,error:null})
        try {
            const supabase = createClient();
            const {data:{user}}= await supabase.auth.getUser();
            if(!user){
                set({error:'user not authenticated',isLoading:false})
                return;
            }
            const {data,error}= await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id',user.id)
                .eq('status','active')
                .order('created_at',{ascending:false})
                .limit(1)
                .single();

            if(error && error.code!== 'PGRST116') throw error;

            set({subscription:data,isLoading:false})
        } catch (error:any) {
            set({
                error:error.message ?? 'failed to fetch subscription',
                isLoading:false
            });
        }
    },
    fetchTransactions:async()=>{
         set({isLoading:true,error:null})
         try{
            const supabase = createClient();
            const {data:{user}}= await supabase.auth.getUser();
            if(!user){
                set({error:'user not authenticated',isLoading:false})
                return;
            }
            const {data,error}= await supabase
                .from('payment_transactions')
                .select('*')
                .eq('user_id',user.id)
                .order('created_at',{ascending:false})
            
            if(error) throw error;
            set({transactions:data||[],isLoading:false})
         }catch(error:any){
            set({
                error:error.message ?? 'failed to fetch transactions',
                isLoading:false
            })
         }
    },
    initializePayment:async(plan:'monthly'|'yearly')=>{
        set({isLoading:true,error:null})
        try {
            const response = await fetch('/api/payments/initialize',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({plan})
            });
            const data = await response.json();

            if(!response.ok) throw new Error(data.error);

            set({isLoading:false})
            return data;
        } catch (error:any) {
            set({
                error:error.message ?? 'failed to initialize payment',
                isLoading:false
            })
            return null;
        }

    },
    verifyPayment:async(reference:string)=>{
        set({isLoading:true,error:null})
        try {
            const response = await fetch('/api/payments/verify',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({reference})
            });
            const data = await response.json();
            if(!response.ok) throw new Error(data.error);
            
            await get().fetchSubscription();
            set({isLoading:false})
            return data.success;
        } catch (error:any) {
            set({
                error:error.message ?? 'failed to verify payment',
                isLoading:false
            })
            return false;
        }
    },
    cancelSubscription:async()=>{
        set({isLoading:true,error:null})
        try {
            const response = await fetch('/api/payments/cancel',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                }
            })
            const data = await response.json();
            if(!response.ok) throw new Error(data.error);
            
            await get().fetchSubscription();
            set({isLoading:false})
         
        } catch (error:any) {
            set({
                error:error.message ?? 'failed to cancel subscription',
                isLoading:false
            });
        }
        
    },
    isPro:()=>{
        const {subscription}=get();
        return subscription?.tier==='pro' && subscription?.status==='active';
        
    },
    canUseFeature:(feature:string)=>{
        const isPro = get().isPro();
        const proFeatures =[
            'ai_flashcard_generation',
            'ai_chat',
            'advance_analytics',
            'file_upload_unlimited'
        ];
        if(proFeatures.includes(feature)){
            return isPro;
        }
        return true;

    },
    clearError:()=>{
        set({error:null})
    }
}))