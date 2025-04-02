"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";

export function NavUser() {
  const { isMobile } = useSidebar();
  // const { user, error, isLoading } = useUser();

  // if (isLoading) return <div>Loading...</div>;
  // if (error) return <div>{error.message}</div>;
  //
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
                {/* <AvatarImage */}
                {/*   src={user?.picture as string} */}
                {/*   alt={user?.name as string} */}
                {/* /> */}
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {/*   <span className="truncate font-medium">{user?.name}</span> */}
                {/*   <span className="truncate text-xs">{user?.email}</span> */}
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
                  {/* <AvatarImage */}
                  {/*   src={user?.picture as string} */}
                  {/*   alt={user?.name as string} */}
                  {/* /> */}
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {/* <span className="truncate font-medium">{user?.name}</span> */}
                  {/* <span className="truncate text-xs">{user?.email}</span> */}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profile">
              <DropdownMenuItem className="hover:cursor-pointer">
                <User className="mr-2 h-4 w-4" />Profile
              </DropdownMenuItem>
            </Link>
            <Link href="/setting">
              <DropdownMenuItem className="hover:cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <Link href="/api/auth/logout">
              <DropdownMenuItem className="hover:cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
