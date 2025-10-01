'use client'
import { useFolderStore } from '@/stores/folderStore';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { Button } from './ui/button';
import { CreateFolderDialog } from './create-folder';
import { Calendar, Edit, Folder, MoreVertical, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import DeleteDialog from './deleteDialog';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import UpdateDialog from './update-dialog';

const FolderComponent = () => {
    const { folders, fetchFolders, loading, error,deleteFolder } = useFolderStore()
  
    const [opendeleteDialog,setOpenDeleteDialog]=useState(false);
    const [folderTodelete,setFolderTodelete]=useState<string|null>();
    
  
    useEffect(() => {
      fetchFolders()
    }, [fetchFolders])
  
    const foldertodeleteid=folders.find(n=>n.id ===folderTodelete)
  
    const handleDelete = async ()=>{
      if(!folderTodelete) return;
      try{
        await deleteFolder(folderTodelete)
        toast.success('folder deleted successfully ')
      }catch(error){
        toast.error('error deleting folder ')
        console.error(error)
      }finally{
        setOpenDeleteDialog(false)
        setFolderTodelete(null)
      }
    }
  
    if (loading && folders.length === 0) {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Folders</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      )
    }
  
    if (error) {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchFolders()}>Try Again</Button>
          </div>
        </div>
      )
    }
  
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Folders</h1>
          <CreateFolderDialog 
            trigger={
              <Button>
                <Folder className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            }
          />
        </div>
       
        {folders.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No folders yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first folder to start organizing your learning materials.
            </p>
            <CreateFolderDialog 
              trigger={<Button>Create your first folder</Button>}
            />
              
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <Card key={folder.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Folder className="h-5 w-5" />
                      <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{folder.name}</CardTitle>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2" >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        
                        <UpdateDialog
                          folder={folder}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="mr-2 h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                          }
                          onSuccess={() => fetchFolders()}
                        />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>{
                            setFolderTodelete(folder.id) 
                            setOpenDeleteDialog(true)}}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </div>
                  {folder.description && (
                    <CardDescription className="text-sm line-clamp-2">
                      {folder.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Link href={`/folders/${folder.id}`}>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Created {formatDistanceToNow(new Date(folder.created_at), { addSuffix: true })} 
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                      <span>0 items</span>                                          {/** we will upadate this when we have stores for the other things  */}
                      <span className="text-blue-600 group-hover:text-blue-800">
                        View folder →
                      </span>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
       <DeleteDialog 
       open={opendeleteDialog}
       onOpenChange={setOpenDeleteDialog}
       title='Delete Folder'
       description={`Are you sure you want to delete ${foldertodeleteid?.name} this action cannot be undone`}
       itemName={foldertodeleteid?.name ||'this folder'}
       onConfirm={handleDelete}
       />
      </div>
    )
}

export default FolderComponent