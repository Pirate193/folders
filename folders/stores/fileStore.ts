
import {create} from 'zustand'
import { createClient } from '@/lib/client'


 export type FileType ='pdf'|'image' |'doc' |'video' |'audio'

export type FileRecord={
    id:string;
    folder_id:string;
    file_name:string;
    file_type:FileType;
    file_url:string;
    created_at:string;
}
 export interface UploadProgress{
    fileId:string
    fileName:string
    progress:number
    status:'uploading'|'completed' |'failed'
    error?:string
 }
interface fileUploadState{
    files:FileRecord[];
    uploadProgress:UploadProgress[]
    isloading: boolean;
    error:string |null

    //methods 
    fetchFiles:(folderId:string)=>Promise<void>;
    uploadFile:(file:File,folderId:string)=>Promise<FileRecord | null>;
    deleteFile:(fileid:string)=>Promise<boolean>;
    clearError:()=>void
    removeUploadProgress:(fileId:string)=>void
}
const getFileType = (file:File):FileType =>{
    const mimeType =file.type.toLowerCase();
    const fileName = file.name.toLowerCase()
    if(mimeType.startsWith('image/')) return 'image';
    if(mimeType ==='application/pdf') return 'pdf';

    //chech by file ecxtension 
    if(fileName.endsWith('.docx') || fileName.endsWith('.doc')||fileName.endsWith('.txt')
    || fileName.endsWith('.rtf')){
      return 'doc'}
    
    //default return doc
    return 'doc';
}
 //function to generate file id
 const generateFileId =()=>{
    return Math.random().toString(36).substring(2)+Date.now().toString(36)
 }
export const useFileStore= create<fileUploadState>((set,get)=>({
    files:[],
    uploadProgress:[],
    error:null,
    isloading:false,

    fetchFiles:async(folderId:string)=>{
        
        try{
             const supabase= createClient();
             set({isloading:true,error:null})
             const {data:files,error}= await supabase.from('files').select('*').eq('folder_id',folderId).order('created_at',{ascending:false});

             if (error){
                throw error
             }
             set({files:files || [],isloading:false})
        }catch(error){
            console.error('error occured',error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch files'
            set({error:errorMessage,isloading:false,files:[]})
        }
    },
    uploadFile:async(file:File,folderId:string)=>{
        const fileId=generateFileId()
        const FileType=getFileType(file)
        const timestamp = Date.now()
        const fileName = `${timestamp}_${file.name}`
        const filePath = `${folderId}/${fileName}`
        const supabase = createClient();
        try{
          //initialize the upload progeress
          set((state)=>({
            uploadProgress:[...state.uploadProgress,
                {
                    fileId,
                    fileName:file.name,
                    progress:0,
                    status:'uploading'
                }
            ],
            error:null
          }))
          //lets upload to bucket
          const {data:uploadData,error:uploadError}= await supabase.storage.from('filesbucket').upload(filePath,file,{ cacheControl:'360',upsert:false})
         if(uploadError) throw uploadError;
         //update progress 
         set((state)=>({
            uploadProgress:state.uploadProgress.map(p=>
                p.fileId === fileId
                ?{...p,progress:50}
                :p
            )
         }))
         //get the public url
         const {data:urlData}=supabase.storage.from('filesbucket').getPublicUrl(filePath)
         if(!urlData.publicUrl) throw new Error('failed to get public url')
         //update progress
        set((state)=>({
            uploadProgress:state.uploadProgress.map(p=>
                p.fileId === fileId?{...p,progress:75}:p
            )
        }))
         //insert into database
         const {data:fileRecord,error:dbError} = await supabase
                   .from('files')
                   .insert({
                    folder_id:folderId,
                    file_name:file.name,
                    file_type:FileType,
                    file_url:urlData.publicUrl
                   })
                   .select()
                   .single()
        
        if(dbError) {
            await supabase.storage.from('filesbucket').remove([filePath])
            throw dbError
        }
        //complete progeress
        set((state)=>({
            uploadProgress:state.uploadProgress.map(p=>
                p.fileId === fileId
                 ?{...p,progress:100,status:'completed'}
                 :p
            ),
            files:[...state.files,fileRecord]
        }))
        setTimeout(()=>{
            get().removeUploadProgress(fileId)
        })
        return fileRecord
        }catch(error){
            const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        
            set((state)=>({
                uploadProgress:state.uploadProgress.map(p=>
                    p.fileId === fileId
                    ?{...p,status:'failed',error:errorMessage}:p
                ),
                error:errorMessage
            }))
           
      return null
        }

    },
    deleteFile:async(fileid) =>{
        
        try{
            const supabase = createClient()
            set({isloading:true,error:null})
            //get the current user
            const fileToDelete= get().files.find(f=>f.id === fileid)
            if(!fileToDelete) throw new Error ('file not found')
            const {error:dbError} = await supabase
                     .from('files')
                     .delete()
                     .eq('id',fileid)
            if(dbError) throw dbError

        //delete from storage
        const url = new URL(fileToDelete.file_url)
        const pathParts = url.pathname.split('/')
        const filePath= pathParts.slice(-2).join('/')
        const {error:storageerror} = await supabase.storage
                        .from('filesbucket')
                        .remove([filePath])
        if(storageerror) console.warn('storage deletion failed ',storageerror)

        set((state)=>({
            files:state.files.filter(f=>f.id !== fileid),
            isloading:false
        }))
        return true
        }catch(error){
           const errorMessage = error instanceof Error ? error.message : 'Delete failed'
          set({ error: errorMessage, isloading: false })
           return false
        }
    },
    clearError:()=>set({error:null}), 
    removeUploadProgress:(fileId:string)=>{
     set((state)=>({
        uploadProgress:state.uploadProgress.filter(p=>p.fileId !== fileId)
     }))
    }
    
}))