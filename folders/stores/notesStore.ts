import { create } from "zustand";
import { createClient } from "@/lib/client";


export type Note ={
    id:string,
    folder_id:string,
    title:string,
    content:string,
    created_at:string
};

interface NoteState{
    notes:Note[];
    currentNote:Note |null
    loading:boolean;
    error:boolean|null;
    

    fetchnotesByfolder:(folderId:string)=>Promise<void>
    createNote:(data:{folderId:string,title:string,content?:string})=>Promise<Note |null>
    updateNote:(id:string,data:{folderId:string,title?:string,content?:string})=>Promise<void>
    deleteNote:(id:string)=>Promise<void>
    setcurrentNote:(noteId:string |null)=>void
}
export const useNotesStore = create<NoteState>((set,get)=>({
    notes:[],
    currentNote:null,
    loading:false,
    error:null,

    fetchnotesByfolder:async(folderId:string)=>{
       set({loading:true,error:null})
       try{
        const supabase = createClient()
        const {data,error} = await supabase.from('notes').select('*').eq('folder_id',folderId).order('updated_at',{ascending:false})

        if (error) throw error
        set({notes:data,loading:false})
       }catch(error:any){
        set({error:error.message??'failed to fetch notes',loading:false})
       }
    },
    createNote:async(data)=>{
        set({loading:true,error:null})
        try{
            const supabase= createClient()
            const {data:newNote,error}= await supabase
                   .from('notes')
                   .insert({
                    folder_id:data.folderId,
                    title:data.title,
                    content:data.content,
                   })
                   .select()
                   .single()
            if (error) throw error

            set(state=>({
                notes:[newNote,...state.notes],
                currentNote:newNote,
                loading:false
            }));
            return newNote
        }catch(error:any){
            set({error:error.message??'error creating notes ',loading:false})
        }
    },
    updateNote:async(id:string,data)=>{
        set({loading:true,error:null})
        try{
            const supabase = createClient()
            const updateData:any={
                updated_at:new Date().toISOString(),
            };
            if(data.title !==undefined)updateData.title = data.title;
            if(data.content !==undefined)updateData.content = data.content;
            const {error}= await supabase.from('notes')
                                     .update(updateData)
                                     .eq('id',id);
            if (error) throw error;
            set(state=>({
                notes:state.notes.map(note=>note.id === id ?{...note,...data,updated_at:updateData.updated_at}
                    :note
                ),
                currentNote:state.currentNote?.id === id 
                      ?{...state.currentNote,...data,updated_at:updateData.updated_at}
                      :state.currentNote,
             loading:false
            }));
        }catch(eror:any){
            set({ 
                error: eror.message || 'Failed to update note', 
                loading: false 
              });
       }
    },
    deleteNote:async(id:string)=>{
      set({loading:true,error:null})
         try{
            const supabase = createClient()
            const {error} = await supabase.from('notes').delete().eq('id',id)
            if(error) throw error

            set(state=>({
             notes: state.notes.filter(notes=>notes.id !== id),
             currentNote: state.currentNote?.id === id ? null : state.currentNote,
             loading:false
            }))
         }catch(error:any){
            set({error:error.message??'erroro deleting note',loading:false})
         }
    },
    setcurrentNote: (noteId) => {
        const notes = get().notes;
        const foundNote = notes.find((n) => n.id === noteId) || null;
        set({ currentNote: foundNote });
      }

}))