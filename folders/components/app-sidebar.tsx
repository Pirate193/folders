'use client'
import { Folder, FolderCheck, FolderIcon, HomeIcon, Search } from 'lucide-react'
import React, { useEffect } from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from './ui/sidebar'
import NavMain from './nav-main'
import NavFolders from './nav-folders'
import NavUser from './nav-user'
import { useFolderStore } from '@/stores/folderStore'

//dummy data
const data = {
    user:{
        name:'pato',
        email:'pato@gmail.com',
        avatar:'https://github.com/shadcn.png',
    },
    navMain:[
        {
            title:'Search',
            url:'#',
            icon: Search
        },
        {
            title:'Home',
            url:'/home',
            icon: HomeIcon
        },
        {
            title:'Folders',
            url:'/folders',
            icon: FolderIcon
        },
    ],
    Folders:[
        {
           name:'folder 1',
           url:'#',
           icon:FolderCheck
        },
        {
            name:'folder 2',
            url:'#',
            icon:FolderCheck
         },
         {
            name:'folder 3',
            url:'#',
            icon:FolderCheck
         }
    ]
}
const AppSidebar = ({...props}:React.ComponentProps<typeof Sidebar>) => {
    const {folders,fetchFolders,loading,error}=useFolderStore();

    useEffect(()=>{
        fetchFolders();
    },[fetchFolders])
  return (
    <Sidebar collapsible='icon' {...props} >
       <SidebarHeader>
          <div>
            <FolderIcon />
          </div>
       </SidebarHeader>
       <SidebarContent>
            <NavMain items={data.navMain}/>
            <NavFolders folders={folders}/>
       </SidebarContent>
       <SidebarFooter>
           <NavUser user={data.user} />
       </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar