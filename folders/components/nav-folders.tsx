"use client";
import {
  Folder,
  Forward,
  LucideIcon,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  useFolderStore,
  type Folder as FolderType,
} from "@/stores/folderStore";

import { toast } from "sonner";
import { CreateFolderDialog } from "./create-folder";

import DeleteDialog from "./deleteDialog";
import Link from "next/link";



const NavFolders = ({ folders }: { folders: FolderType[] }) => {
  const { isMobile } = useSidebar();
  const [opendeleteDialog,setOpenDeleteDialog]=useState(false);
  const [folderTodelete,setFoldertodelete]=useState<FolderType | null>(null)
  const { setCurrentFolder, currentFolderId, loading,deleteFolder } = useFolderStore();
  
  
  
  const handleDeleteClick = (folder: FolderType) => {
    setOpenDeleteDialog(true)
    setFoldertodelete(folder)
  };
  const handleDelete = async ()=>{
     if(!folderTodelete) return
     try{
      await deleteFolder(folderTodelete.id);
      toast.success('folder deleted succesfully')
      setOpenDeleteDialog(false)
      setFoldertodelete(null)
         
     }catch(error){
      toast.error('failed to delete folder ')
     }
  }

  
  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="flex items-center justify-between">
          Folders
          <CreateFolderDialog
            trigger={
              <button className="opacity-60 hover:opacity-100 transition-opacity">
                <Plus className="h-4 w-4" />
              </button>
            }
          />
        </SidebarGroupLabel>
        <SidebarMenu>
          {folders && folders.length > 0
            ? folders.map((folder) => (
                <SidebarMenuItem key={folder.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentFolderId === folder.id}
                  >
                    <Link
                      href={`/folders/${folder.id}`}
                      onClick={() => setCurrentFolder(folder.id)}
                    >
                      <Folder className="mr-2" />
                      <span className="truncate">{folder.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 rounded-lg"
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "end" : "start"}
                    >
                      <DropdownMenuItem>
                        <Folder className="text-muted-foreground" />
                        <span>View folder</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Forward className="text-muted-foreground" />
                        <span>Share Folder</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onSelect={() => handleDeleteClick(folder)}
                      >
                        <Trash2 className="text-red-600" />
                        <span>Delete Folder</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))
            : !loading && (
                <SidebarMenuItem>
                  <div className="px-2 py-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      No folders yet
                    </p>
                    <CreateFolderDialog
                      trigger={
                        <SidebarMenuButton className="w-full justify-center">
                          <Plus className="mr-2 h-4 w-4" />
                          Create folder
                        </SidebarMenuButton>
                      }
                    />
                  </div>
                </SidebarMenuItem>
              )}

          {loading && folders.length === 0 && (
            <SidebarMenuItem>
              <div className="px-2 py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Loading folders...
                </p>
              </div>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroup>

      <DeleteDialog 
      open={opendeleteDialog}
      onOpenChange={setOpenDeleteDialog}
      title="Delete folder"
      description={`Are you sure you want to delete ${folderTodelete?.name} This action cannot be undone`}
      itemName={folderTodelete?.name||'null'}
      onConfirm={handleDelete}
      />
    </>
  );
};

export default NavFolders;

