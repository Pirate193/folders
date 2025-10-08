import { createClient } from '@/lib/client';
import { profile } from 'console';
import {create} from 'zustand';

export interface Profile{
    id:string;
    username:string;
    email:string;
    avatar_url:string;
    created_at:string;

    subscription_tier?:'free'|'pro';
    subscription_status?:'active'|'inactive'|'cancelled'|'expired';
    subscription_start_date?:string;
    subscription_end_date?:string;
    paystack_customer_code?:string;
    paystack_subscription_code?:string;
}

interface ProfileState{
    profile:Profile[] ;
    currentProfile:Profile |null;
    isLoading:boolean;
    error:string |null;

    fetchProfile:()=>Promise<void>;
    updateProfile:(data:{username:string,avatar_url:string},file?:File)=>Promise<void>
    clearError:()=>void;
}

export const useProfileStore = create<ProfileState>((set,get)=>({
    profile:[],
    currentProfile:null,
    isLoading:false,
    error:null,

    fetchProfile:async()=>{
        set({isLoading:true,error:null})
        try{
            const supabase = createClient()
            const {data:{user}} = await supabase.auth.getUser();
            if(!user){
                set({error:'User not authenticated',isLoading:false})
                return
            }
            
            // First, try to fetch existing profile from database
            const {data:existingProfile, error:fetchError}= await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id',user.id)
                  .single();
            
            // If profile exists, use it
            if(existingProfile && !fetchError){
                set({profile:existingProfile,currentProfile:existingProfile,isLoading:false})
                return
            }
            
            // If profile doesn't exist, create one with metadata
            const {data:newProfile, error:createError}= await supabase
                .from('profiles')
                .insert({
                    id:user.id,
                    email:user.email,
                    username:user.user_metadata.username ||  user.email?.split('@')[0] || 'user',
                    avatar_url:user.user_metadata?.avatar_url || ''
                })
                .select('*')
                .single();
            
            if(createError) throw createError;
              
            set({profile:newProfile,currentProfile:newProfile,isLoading:false})
        }catch(error){
            set({error:error instanceof Error ? error.message : 'Failed to fetch profile',isLoading:false})
            throw error
        }
    },
    updateProfile:async(data,file)=>{
        set({isLoading:true,error:null})
        try{
            const supabase = createClient()
            let avatarUrl = data.avatar_url;

            // Only upload file if provided
            if(file && file.size > 0){
                const timestamp = Date.now()
                const fileName = `${timestamp}_${file.name}`
                const filePath = `${get().currentProfile?.id}/${fileName}`
                
                const {data:storageData,error:storageError}= await supabase.storage
                     .from('avatar')
                     .upload(filePath,file,{
                        cacheControl:'3600',
                        upsert:true
                     })
                if(storageError) throw storageError;
                
                const{data:urlData}=supabase.storage
                      .from('avatar')
                      .getPublicUrl(filePath) 
                if(!urlData.publicUrl) throw new Error('Failed to get public url')
                
                avatarUrl = urlData.publicUrl;
            }
            
            const {data:profileData,error:profileError}= await supabase
                  .from('profiles')
                  .update({
                    username:data.username,
                    avatar_url:avatarUrl
                  })
                  .eq('id',get().currentProfile?.id)
                  .select()
                  .single()
            if(profileError) throw profileError;
            set((state)=>({
                profile:profileData,
                currentProfile:profileData,
                isLoading:false
            }))
            
        }catch(error){
            set({error:error instanceof Error ? error.message : 'Failed to update profile',isLoading:false})
            throw error
        }
    },
    clearError:()=>set({error:null})
}))