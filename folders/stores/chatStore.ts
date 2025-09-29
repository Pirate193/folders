import { createClient } from "@/lib/client";
import { create } from "zustand";

export interface ChatMessage {
    id:string;
    content:string;
    role:'user' | 'assistant';
    timestamp:Date;
    folderId?:string;
}

interface ChatState{
    messages:ChatMessage[];
    isLoading:boolean;
    isSidebarOpen:boolean;
    currentFolderId:string | null;

    addMessage:(message:Omit<ChatMessage,'id' | 'timestamp'>)=>void;
    setLoading:(loading:boolean)=>void;
    toggleSidebar:()=>void;
    setSidebarOpen:(open:boolean)=>void;
    setCurrentFolderId:(folderId:string | null)=>void;
    clearMessages:()=>void;
    loadMessagesForFolder:(folderId:string)=>Promise<void>;
}

export const useChatStore= create<ChatState>((set,get)=>({
    messages:[],
    isLoading:false,
    isSidebarOpen:false,
    currentFolderId:null,

    addMessage:(message)=>{
        const newMessage:ChatMessage={
            ...message,
            id:crypto.randomUUID(),
            timestamp:new Date()
        };

        set((state)=>({
            messages:[...state.messages,newMessage]
        }));
    },
    
    setLoading:(loading)=> set({isLoading:loading}),
    
    toggleSidebar:()=>set((state)=>({isSidebarOpen:!state.isSidebarOpen})),
    
    setSidebarOpen:(open)=>set({isSidebarOpen:open}),
    
    setCurrentFolderId:(folderId)=>set({currentFolderId:folderId}),
    
    clearMessages:()=>set({messages:[]}),
    
    loadMessagesForFolder:async(folderId)=>{
        try{
            const supabase = createClient();
        const {data:messages,error}= await (await supabase)
              .from('chat_messages')
              .select('*')
              .eq('folder_id',folderId)
              .order('created_at',{ascending:false})
              .limit(100);
        if(error){
            console.log(error)
            
        }
        const transformedMessages = messages?.map(msg=>({
            id:msg.id,
            content:msg.content,
            role:msg.role,
            timestamp: new Date(msg.created_at),
            folderId:msg.folder_id
        })) || [];
        set({messages:transformedMessages,currentFolderId:folderId})
        }catch(error){
            console.error('Failed to load messages:',error);
            // On error, ensure messages is still an array
            set({messages: [], currentFolderId:folderId})
        }
    }
}))