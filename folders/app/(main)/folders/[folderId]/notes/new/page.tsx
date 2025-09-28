'use client'
import React from 'react'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useNotesStore } from '@/stores/notesStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Copy, Download, MoreVertical, Save, Trash2 } from 'lucide-react'
import { useFolderStore } from '@/stores/folderStore'
import Toolbar from '@/components/toolbar'
import TiptapEditor from '@/components/editor'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import DeleteDialog from '@/components/deleteDialog'

export default function NewNotePage() {
    const params = useParams()
  const router = useRouter()
  const folderId = params.folderId as string
  
  const { createNote,currentNote,notes,deleteNote } = useNotesStore()
  const { folders } = useFolderStore()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(true)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
const [showDeleteDialog,setShowDeleteDialog]=useState(false)
  
  const folder = folders.find(f => f.id === folderId)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const newNote = await createNote({
        folderId,
        title: title || 'Untitled Note',
        content,
      })
      
      if (newNote) {
        router.push(`/folders/${folderId}/notes/${newNote.id}`)
      }
    } catch (error) {
      console.error('Failed to create note:', error)
    } finally {
      setIsSaving(false)
    }
  }
  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'note'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
  }
  

  return (
    <div className='min-h-screen '>
     <div className='flex flex-row justify-between '  >
          <div className='flex flex-row ' >
        <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/folders/${folderId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          <Input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className='w-50'
          />
          
          <div className="flex flex-row mx-10 ">
                {folder && <span>in {folder.name}</span>}
                {lastSaved && (
                  <>
                    <span>•</span>
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </>
                )}
                {isSaving && <span>Saving...</span>}
              </div>
              </div>
          <div>
         <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
        </Button>
        <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy content
                </DropdownMenuItem>
                
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
        </div>
    
    <Toolbar />
    <TiptapEditor 
    content={content}
    onChange={setContent}
    />
   
 </div>
  )
}
