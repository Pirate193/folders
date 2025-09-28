import React, { useEffect, useState } from 'react'
import { useNotesStore } from '@/stores/notesStore'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import DeleteDialog from '@/components/deleteDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from './ui/button'
import { FileText, MoreVertical, Notebook, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'


const NoteComponent = ({folderId}:{folderId:string}) => {
  const { fetchnotesByfolder, notes, deleteNote } = useNotesStore()
  const[showDeleteDialog,setShowDeleteDialog]=useState(false);
  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null)
  const noteToDelete = notes.find(n => n.id === noteToDeleteId);
  const router = useRouter()

  
  useEffect(() => {
    fetchnotesByfolder(folderId);
  }, [folderId, fetchnotesByfolder]);

  const handleDeleteNote = async () => { 
    if (!noteToDeleteId) return; 
    try{
      await deleteNote(noteToDeleteId)
      toast.success('Note deleted successfully!')
    }catch(error){
        toast.error('Error deleting note')
        console.error(error)
    }finally{
      setShowDeleteDialog(false)
      setNoteToDeleteId(null); 
    }
  }

  const handleNoteClick = (noteId: string) => {
    router.push(`/folders/${folderId}/notes/${noteId}`)
  }
  return (
    <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Notes</h2>
                <p className="text-sm text-muted-foreground">Your text notes and documents</p>
              </div>
              <Link href={`/folders/${folderId}/notes/new`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Note
                </Button>
              </Link>
            </div>

            {notes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                  <p className="text-gray-500 mb-4">Create your first note to get started</p>
                  <Link href={`/folders/${folderId}/notes/new`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first note
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {notes.map((note) => (
                  <Card 
                    key={note.id} 
                    className="group hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleNoteClick(note.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Notebook className="h-4 w-4 shrink-0" />
                          <CardTitle className="text-base truncate">
                            {note.title || 'Untitled Note'}
                          </CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setNoteToDeleteId(note.id); 
                                setShowDeleteDialog(true); 
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                             
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                    
                  </Card>
                ))}
              </div>
            )}
            {noteToDelete && (
        <DeleteDialog 
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title='Delete Note'
          description={`Are you sure you want to delete "${noteToDelete.title || 'this note'}"? This action cannot be undone.`}
          itemName={noteToDelete.title || 'this note'}
          onConfirm={handleDeleteNote}
        />
      )}
          </div>
  )
}

export default NoteComponent