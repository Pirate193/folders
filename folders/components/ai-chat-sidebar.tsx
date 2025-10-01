import { useChatStore } from '@/stores/chatStore'
import { Bot, Loader2, Send, X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import MessageBubble from './messageBubble';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

const AIChatSidebar = ({folderId}:{folderId:string}) => {
  const {messages,loadMessagesForFolder,addMessage,isLoading,isSidebarOpen,currentFolderId,setSidebarOpen,setCurrentFolderId,setLoading}=useChatStore();
  const [input, setInput] = useState('');

  // useEffect(()=>{
  //   loadMessagesForFolder(folderId)
  // },[folderId])
  useEffect(()=>{
    if(folderId !== currentFolderId){
      loadMessagesForFolder(folderId)
    }
  },[folderId,currentFolderId,loadMessagesForFolder])
  const handleSend = async ()=>{
    if(!input.trim() || isLoading) return
    const usermessage = input.trim()
    setInput('')
    addMessage({
      content:usermessage,
      role:'user',
      folderId
    })
    setLoading(true)
    try{
      const response = await fetch('/api/chat',{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          message:usermessage,
          folderId,
          messages:messages.slice(-10)

        }),
      })
      if(!response.ok){
        throw new Error('Failed to send response')
      }
      const data = await response.json()
      addMessage({
        content:data.message,
        role:'assistant',
        folderId

      })
    }catch(error){
      console.error('Failed to send message:',error)
      addMessage({
        content:'sorry I encountered an error. please try again',
        role:'assistant',
        folderId
      })
    }finally{
      setLoading(false)
    }
  }
  const handleKeyboradPress = (e:React.KeyboardEvent)=>{
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault()
      handleSend()
    }
  }

 if (!isSidebarOpen) return null
  return (
    <div className='fixed inset-y-0 right-0 z-50 w-96 bg-background border-1 border-gray-700 flex flex-col '  >
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-700'>
        <div className='flex items-center gap-2'>
          <div>
            <Bot className='h-4 w-4 text-muted-foreground' />
          </div>
          <div>
          <h2 className='font-semibold text-muted-foreground' >
            AI Study Assistant
          </h2>
          </div>
        </div>
        <Button variant='ghost' onClick={()=>setSidebarOpen(false)} className='h-8 w-8 p-0'  size='icon'>
          <X className='h-4 w-4' />
        </Button>
      </div>
      {/* chat message */}
      <ScrollArea className='flex-1 px-4 h-[calc(100vh-5rem)] overflow-y-auto '>
        <div>
          {!messages || messages.length ===0 ?(
              <div className='text-center text-muted-foreground py-12' >
                  <div className='w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4' >
                    <Bot className='h-8 w-8 text-white' />
                    </div>
                <h3 className='font-semibold text-lg mb-2' >
                  Welcome to your AI Study Assistant
                </h3>
                <p className='text-sm text-muted-foreground' >
                  I'm here to help you with your studies. 
                </p>
                <div className='text-xs space-y-1' >
                <p>.Ask me anything about your folder, notes, and files.</p>
                <p>.Get help with flashcards, assignments, and projects.</p>
                </div>
              </div>
          ):(
             <div>
              {messages.map((message)=>(
                <MessageBubble key={message.id} message={message} />
              ))}
              </div>
          )}
          {isLoading && (
            <div className='flex items-start gap-3' >
               <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center' >
                <Bot className='h-4 w-4 '/>
               </div>
               <div className='flex-1' >
                <div className='bg-muted rounded-lg px-3 py-2 max-w-[85%]' >
                  <div className='flex items-center gap-2' >
                    <Loader2 className='h-3 w-3 animate-spin'/>
                    <span className='text-xs text-muted-foreground' >Thinking...</span>
                    </div>
         
                  </div>
                </div>
            </div>
          )}

        </div>

      </ScrollArea>
     {/* input */}
     <div className='p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60' >
      <div className='flex gap-2 items-center' >
        <Textarea 
        value={input}
        onChange={(e)=>setInput(e.target.value)}
        placeholder='Ask me anything...'
        disabled={isLoading}
        className='flex-1'
        onKeyDown={handleKeyboradPress}
        />
        <Button disabled={isLoading || !input.trim() }
        size='sm'
        onClick={handleSend}
        className='px-3'
        >
          <Send className='h-4 w-4' />
        </Button>
      </div>
      <p className='text-xs text-muted-foreground mt-2 text-center' >
      Study Bot can make mistakes check info
      </p>
     </div>
    </div>
  )
}

export default AIChatSidebar