'use client'
import React, { useState, useEffect } from 'react'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from './ui/sidebar'
import { DropdownMenu, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles, Crown } from 'lucide-react'
import { DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu'
import { Badge } from './ui/badge'
import AccountDialog from './account-dialog'
import BillingDialog from './billing-dialog'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import PricingDialog from './pricing-dialog'
import { useProfileStore } from '@/stores/profileStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'

const NavUser = ({user}:{
    user:{
        username:string
        email:string
        avatar_url:string
    }
}) => {
   
  const router=useRouter();
  const {isMobile} = useSidebar()
  const { currentProfile, fetchProfile } = useProfileStore()
  const { fetchSubscription, isPro } = useSubscriptionStore()
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false)
  const [billingDialogOpen, setBillingDialogOpen] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchSubscription()
  }, [fetchProfile, fetchSubscription])

  const isProUser = isPro()
    const signOut =async()=>{
      const supabase = createClient()
      try{
        const {error}= await supabase.auth.signOut()
        if(error){
          throw error
        }
        toast.success('signed out successfully')
        router.push('/')
      
      }catch(error){  
        toast.error('error signing out')
        console.error(error)
      }
    }
  return (
    <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar_url} alt={user.username} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{user.username}</span>
                {isProUser && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                    <Crown className="h-2.5 w-2.5 mr-0.5" />
                    PRO
                  </Badge>
                )}
              </div>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar_url} alt={user.username} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{user.username}</span>
                  {isProUser && (
                    <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                      <Crown className="h-2.5 w-2.5 mr-0.5" />
                      PRO
                    </Badge>
                  )}
                </div>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {!isProUser && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={()=>setPricingDialogOpen(true)}>
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setAccountDialogOpen(true)}>
              <BadgeCheck />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setBillingDialogOpen(true)}>
              <CreditCard />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={()=>signOut()}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
    <AccountDialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen} />
    <PricingDialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen} />
    <BillingDialog open={billingDialogOpen} onOpenChange={setBillingDialogOpen} />
  </SidebarMenu>
  )
}

export default NavUser