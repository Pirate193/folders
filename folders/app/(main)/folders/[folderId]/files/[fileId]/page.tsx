'use client'
import { Button } from '@/components/ui/button';
import { useFileStore } from '@/stores/fileStore';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import PDFViewer from '@/components/pdf-viewer'
import Image from 'next/image';

function FileViewPage() {
    const params = useParams();
    const router = useRouter();
    const fileId = params.fileId as string;
    const folderId = params.folderId as string;

    const {files,fetchFiles}=useFileStore();
    const file = files.find((file)=> file.id === fileId);

    useEffect(()=>{
        if(files.length ===0){
            fetchFiles(folderId)
        }
    },[fetchFiles,folderId,files.length]);

    if(!file){
        return (
            <div className='flex items-center justify-center h-[600px] w-full' >
                <div className='flex items-center justify-center ' >
                    <p> File not Found</p>
                    <Button   onClick={()=>router.push(`/folders/${folderId}`)} >
                        <ArrowLeft className='h-4 w-4' /> 
                    </Button>
                </div>
            </div>
        )
    }
    const renderFileViewer =()=>{
        switch(file.file_type){
            case 'pdf':
                return(
                    <PDFViewer 
                        fileUrl={file.file_url}
                        fileName={file.file_name}
                    />
                )
            case 'image':
                return(
                    <Image 
                    src={file.file_url}
                    alt={file.file_name || 'image'}
                    className='max-w-full h-[100vh] object-contain'
                    />
                )
            default:
                return(
                    <div className='text-center py-12'>
                        <p className='text-gray-100 mb-4'>
                            Preview not available yet for this file type 
                        </p>
                        <Button asChild >
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className='h-4 w-4 mr-2' />
                                Open File in new tab
                            </a>
                        </Button>
                    </div>
                );
        }
    }
  return (
    <div className='min-h-screen  ' >
      {/* header  */}
      <div className='flex flex-row  justify-between items-center mt-1' >
        <Button onClick={()=>router.push(`/folders/${folderId}`)} variant='outline' size='sm' >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to folder
        </Button>
         <div  className='flex flex-row items-center gap-2' >
            <h1>{file.file_name} </h1>
            <p>
                uploaded at {new Date(file.created_at).toLocaleDateString()}
            </p>
         </div>
         <Button asChild >
            <a href={file.file_url} target="_blank" rel="noopener noreferrer" download>
            <Download className='h-4 w-4 mr-2' />
            Download
            </a>
         </Button>
       
      </div>
      {/* file viewer */}
       <div className='mt-4 h-[calc(100vh-100px)]' >
        {renderFileViewer()}
    </div>
    </div>
  )
}

export default FileViewPage