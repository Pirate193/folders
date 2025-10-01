'use client'
import AIChatSidebar from '@/components/ai-chat-sidebar';
import FileUpload from '@/components/fileupload';
import FlashcardList from '@/components/flashcard-list';
import NoteComponent from '@/components/notes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChatStore } from '@/stores/chatStore';
import { useFileStore } from '@/stores/fileStore';
import { useFolderStore } from '@/stores/folderStore';
import { useNotesStore } from '@/stores/notesStore';
import { useFlashcardStore } from '@/stores/flashcardStore';
import { ArrowLeft, BrainIcon, Folder, Link } from 'lucide-react';
import React, { useEffect } from 'react'
import StudyDashboard from '@/components/study-dashboard';

function overview({folderId}:{folderId:string}) {
    const { folders, currentFolder, setCurrentFolder, fetchFolders, loading } =useFolderStore();
    const {files,fetchFiles}=useFileStore()
    const {flashcards,fetchFlashcardsByFolder}=useFlashcardStore()
   useEffect(()=>{
    if(!folders.length){
        fetchFolders()
    }
    setCurrentFolder(folderId)
   },[folderId,fetchFolders,setCurrentFolder])
   useEffect(()=>{
       fetchFiles(folderId)
       fetchFlashcardsByFolder(folderId)
       fetchnotesByfolder(folderId)
   },[])
   
   const folder = folders.find((folder)=>folder.id === folderId)
   const {notes,fetchnotesByfolder}=useNotesStore()
   const {toggleSidebar,isSidebarOpen}=useChatStore()
   if(loading && !folder){
       return(
        <div className='flex items-center justify-center h-[600px] w-full'>
            <Skeleton className='h-[600px] w-full'/>
            <Skeleton className='h-[600px] w-full'/>
        </div>
       )
   }
   if(!folder){
    return(
        <div className="p-6">
        <div className="text-center py-12">
          <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Folder not found
          </h3>
          <p className="text-gray-500 mb-4">
            The folder you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <Link href="/folders">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Folders
            </Button>
          </Link>
        </div>
      </div>
    )
   }
  return (
    <div className="p-6">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Link href="/folders">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Folder className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">{folder.name}</h1>
          </div>
          {folder.description && (
            <p className="text-gray-600 mt-1">{folder.description}</p>
          )}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={toggleSidebar}>
        <BrainIcon className="h-4 w-4" />
      </Button>
    </div>

    {/* Content Tabs */}
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{notes.length}</div>
                <p className="text-xs text-muted-foreground">documents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Flashcards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{flashcards.length}</div>
                <p className="text-xs text-muted-foreground">cards</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{files.length}</div>
                <p className="text-xs text-muted-foreground">uploaded</p>
              </CardContent>
            </Card>
          </div>

          {/* Study Dashboard - Full Width */}
          {flashcards.length > 0 && (
            <div className="mt-6">
              <StudyDashboard folderId={folderId} />
            </div>
          )}
      </TabsContent>
      {/*  notes  */}
      <TabsContent value="notes">
        <NoteComponent folderId={folderId} />
      </TabsContent>
      {/* flashcards */}
      <TabsContent value="flashcards">
        <FlashcardList folderId={folderId} />
      </TabsContent>
      {/* files */}
      <TabsContent value="files">
       <FileUpload folderId={folderId} />
      </TabsContent>
    </Tabs>
    <AIChatSidebar folderId={folderId}/>
  </div>
  )
}

export default overview