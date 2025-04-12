import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

// TODO: Check if member from database

export function SidebarHeaderContent() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex space-x-2 p-2 items-center">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
          <GalleryVerticalEnd className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">Twisty Moto</span>
          <Link className="w-min" href="/membership">
            <span className="truncate text-xs text-yellow-300">Non Member</span>
          </Link>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
