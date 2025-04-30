"use client";

import Link from "next/link";
import { useStore } from "@/app/providers";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";

export function NavUser() {
  const displayProfile = useStore((state) => state.displayProfile);
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent hover:cursor-pointer data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8">
                {displayProfile && displayProfile.avatarUrl !== null
                  ? (
                    <AvatarImage
                      src={displayProfile.avatarUrl}
                      alt="User Avatar"
                    />
                  )
                  : (
                    <AvatarImage
                      src="/placeholder-avatar.png?height=32&width=32"
                      alt="User Avatar"
                    />
                  )}
                <AvatarFallback className="rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {displayProfile.username
                    ? <span>{displayProfile.username}</span>
                    : <Skeleton className="h-6 w-full max-w-32" />}
                </span>
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
                <Avatar className="h-8 w-8">
                  {displayProfile && displayProfile.avatarUrl !== null
                    ? (
                      <AvatarImage
                        src={displayProfile.avatarUrl}
                        alt="User Avatar"
                      />
                    )
                    : (
                      <AvatarImage
                        src="/placeholder-avatar.png?height=32&width=32"
                        alt="User Avatar"
                      />
                    )}
                  <AvatarFallback className="rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 truncate">
                  {displayProfile
                    ? (
                      <p className="text-sm font-medium leading-none overflow-hidden overflow-ellipsis">
                        {displayProfile.username}
                      </p>
                    )
                    : <Skeleton className="w-[100px] h-[20px] rounded-full" />}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/account/profile">
              <DropdownMenuItem className="hover:cursor-pointer">
                <User className="mr-2 h-4 w-4" />Profile
              </DropdownMenuItem>
            </Link>
            <Link href="/account/settings">
              <DropdownMenuItem className="hover:cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <Link prefetch={false} href="/api/auth/logout">
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
