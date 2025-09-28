'use client'
import TiptapEditor from '@/components/editor'
import Toolbar from '@/components/toolbar'
import { useFolderStore } from '@/stores/folderStore'
import { useNotesStore } from '@/stores/notesStore'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Copy, Download, MoreVertical, Save, Trash2 } from 'lucide-react'
import DeleteDialog from '@/components/deleteDialog'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

function NotesPage() {
    const params = useParams()
    const noteId = params.noteId as string
    const folderId = params.folderId as string
    const router = useRouter()
    
    const {
        notes,
        currentNote,
        setcurrentNote,
        updateNote,
        deleteNote,
        fetchnotesByfolder,
        loading,
        createNote,
      } = useNotesStore()
      const { folders } = useFolderStore()
       const folder = folders.find(f => f.id === folderId)
       const [title, setTitle] = useState('')
       const [content, setContent] = useState('')
       const [isSaving, setIsSaving] = useState(false)
     const [isEditMode, setIsEditMode] = useState(true)
       const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showDeleteDialog,setShowDeleteDialog]=useState(false)
  const debouncedTitle = useDebounce(title, 1500)
  const debouncedContent = useDebounce(content, 1500)
  useEffect(() => {
    if (notes.length === 0) {
      fetchnotesByfolder(folderId)
    }
  }, [folderId, notes.length, fetchnotesByfolder])

  useEffect(() => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      setcurrentNote(noteId)
      setTitle(note.title || '')
      setContent(note.content || '')
    }
  }, [noteId, notes, setcurrentNote])
  useEffect(() => {
    if (currentNote && 
        (debouncedTitle !== currentNote.title || debouncedContent !== currentNote.content) &&
        (debouncedTitle || debouncedContent)) {
      handleAutoSave()
    }
  }, [debouncedTitle, debouncedContent])

  const handleAutoSave = async () => {
    setIsSaving(true)
    try {
      await updateNote(noteId, {
        folderId,
        title: title || 'Untitled Note',
        content,
      })
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }
  const handleDelete = async () => {
    try{
      
      await deleteNote(noteId)

     toast.success('note deleted succesfully');
     router.push(`/folders/${folderId}`)
     
    }catch(error){
       toast.error('failed to delete note ')
       console.error(error)
    }finally{
      setShowDeleteDialog(false)
    }
  }
  const handleManualSave = async () => {
    setIsSaving(true)
    try {
      await updateNote(noteId, {
        folderId,
        title: title || 'Untitled Note',
        content,
      })
      setLastSaved(new Date())
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }
  //to do add export 
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


  if (loading && !currentNote) {
    return (
      <div className="h-screen flex flex-col">
        <div className="border-b px-6 py-4">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  if (!currentNote && !loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Note not found</p>
          <Button onClick={() => router.push(`/folders/${folderId}`)}>
            Go back to folder
          </Button>
        </div>
      </div>
    )
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
         <Button onClick={handleManualSave} disabled={isSaving}>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={()=>{
                    setShowDeleteDialog(true)
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
        </div>
        
        <div className='border-b bg-background z-10' >
        <Toolbar />
        </div>
        
        <TiptapEditor 
        content={content}
        onChange={setContent}
        />

        <DeleteDialog 
      open={showDeleteDialog}
      onOpenChange={setShowDeleteDialog}
      title='Delete Note'
      description={`Are you sure you want to delete ${currentNote?.title}`}
      itemName={currentNote?.title || 'this note '}
      onConfirm={handleDelete}
      />
     </div>
  )
}

export default NotesPage