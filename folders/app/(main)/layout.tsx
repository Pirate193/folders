import React from "react";
import AppSidebar from "@/components/app-sidebar";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from 'sonner'


export default async function MainLayout({children}:{children:React.ReactNode}){
  

  return (
   
      <SidebarProvider>
          <AppSidebar/>
          <SidebarTrigger />
          <main className="flex-1">
          
          {children}
      </main>

      <Toaster />
      
      </SidebarProvider>
  )
}