import {create} from 'zustand'
import { createClient } from '@/lib/client'


export type Folder ={
    id:string;
    name:string;
    description?:string|null;
    user_id:string;
    created_at:string;
};

interface FolderState{
    folders:Folder[];
    currentFolder:Folder|null;
    currentFolderId: string |null;
    loading:boolean;
    error?:string |null;

    //methods 
    fetchFolders:()=>Promise<void>;
    createFolder:(data:{name:string;description?:string})=>Promise<Folder |null>;
    updateFolder:(id:string,data:{name?:string; description?:string|null})=>Promise<void>
    deleteFolder:(id:string)=>Promise<void>;
    setCurrentFolder:(folderId:string)=> void;
    clearSelectedFolder:()=>void;
    clearError:()=>void;
    
};
export const useFolderStore = create<FolderState>((set,get)=>({
    folders:[],
    currentFolder:null,
    currentFolderId:null,
    loading:false,
    error:null,


  fetchFolders: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data: { user }} = await supabase.auth.getUser();
      if (!user) {
        set({ error: "Not authenticated", loading: false });
        return;
      }
      const userId = user.id;

      const { data, error } = await supabase
        .from("folders")
        .select("id, name, description, user_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ folders: data ?? [], loading: false });
    } catch (err: any) {
      console.error("fetchFolders err", err);
      set({ error: err.message ?? "Failed to fetch folders", loading: false });
    }
  },

  createFolder: async (data ) => {
    set({loading:true,error:null});
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data:newFolder, error } = await supabase
        .from("folders")
        .insert([{
          user_id:user.id,
          name:data.name,
          description:data.description||null,
        }])
        .select()
        .single();

      if (error) throw error;

      set( state =>({
        folders:[newFolder,...state.folders],
        loading:false
      })
      );

      return newFolder;
    } catch (err: any) {
      
      set({ error: err.message ?? "Failed to create folder",loading:false});
      return null;
    }
  },

  updateFolder: async (id, data) => {
    set({loading:true,error:null});
    try {
      const supabase = createClient();

      const { error } = await supabase.from("folders").update({name:data.name,description:data.description}).eq("id", id);

      if (error) throw error;
      set(state=>({
        folders:state.folders.map(folder=>
           folder.id===id
           ?{...folder,...data}
           :folder
        ),
        currentFolder:state.currentFolder?.id===id
        ?{...state.currentFolder,...data}
        : state.currentFolder,
        loading :false
      }));
      
    } catch (err: any) {
      
      set({ error: err.message ?? "Failed to update folder",loading:false });
    }
  },

  deleteFolder: async (id) => {
    set({loading:true,error:null})

    try {
      const supabase=createClient();
      const { error } = await supabase.from("folders").delete().eq("id", id);
      if (error) throw error;
      set(state=>({
        folders:state.folders.filter(folder=>folder.id !==id),
        currentFolder:state.currentFolder?.id ===id? null:state.currentFolder,
        currentFolderId:state.currentFolderId===id?null :state.currentFolderId,
        loading:false
      }))
      
    } catch (err: any) {
      
      set({ error: err.message ?? "Failed to delete folder" ,loading:false});
    }
  },
  setCurrentFolder:(folderId)=>{
    const folder = get().folders.find(f=>f.id === folderId);
    set({
      currentFolder:folder || null,
      currentFolderId:folderId
    });
  },
  clearSelectedFolder:()=>{
   set({
    currentFolder:null,
    currentFolderId:null
   })
  },
  clearError:()=>{
    set({error:null})
  }

}));