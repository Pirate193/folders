import { createClient } from "@/lib/server";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request:NextRequest){
    try{
        const {searchParams}=request.nextUrl;
        const folderId = searchParams.get('folderId');
        if(!folderId){
            return NextResponse.json({error:'folderId is required'}, {status:400})
        }
        const supabase = createClient();
        const {data:messages,error}= await (await supabase)
              .from('chat_messages')
              .select('*')
              .eq('folder_id',folderId)
              .order('created_at',{ascending:false})
              .limit(100);
        if(error){
            console.log(error)
            return NextResponse.json({error:error.message},{status:500})
        }
        const transformedMessages = messages.map(msg=>({
            id:msg.id,
            content:msg.content,
            role:msg.role,
            timestamp: new Date(msg.created_at),
            folderId:msg.folder_id
        })) || [];
        return NextResponse.json({transformedMessages})
    }catch(error:any){
        console.log(error)
        return NextResponse.json({error:error.message},{status:500})
    }
}