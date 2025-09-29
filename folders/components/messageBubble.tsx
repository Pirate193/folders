import { cn } from '@/lib/utils'
import { ChatMessage } from '@/stores/chatStore'
import { Bot, User } from 'lucide-react'
import React from 'react'
import { format } from 'date-fns'

export default function MessageBubble({message}:{message:ChatMessage}) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('flex gap-3',isUser ?'flex-row-reverse': 'flex-row')} >
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',isUser ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-muted')}>
       {isUser ? <User className='h-4 w-4' />:<Bot className='h-4 w-4' /> }
      </div>
      <div className={cn('flex-1 space-y-1', isUser ? 'text-right' : 'text-left')}>
        <div className={cn(
          'inline-block px-3 py-2 rounded-lg text-sm max-w-[85%] break-words',
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm' 
            : 'bg-muted rounded-bl-sm'
        )}>
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        <div className={cn(
          'text-xs text-muted-foreground px-1',
          isUser ? 'text-right' : 'text-left'
        )}>
          {format(new Date(message.timestamp), 'h:mm a')}
        </div>

      </div>
    </div>
  )
}
