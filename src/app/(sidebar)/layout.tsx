"use client"

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import RouteBreadcrumbs from "@/components/route-editor-components/route-breadcrumbs";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { IconLayoutSidebar } from "@tabler/icons-react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center bg-primary-foreground gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 overflow-x-hidden">
            <ToggleSidebar />
            <RouteBreadcrumbs />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ToggleSidebar() {
  const { toggleSidebar } = useSidebar()

  return (
    <button className="hover:cursor-pointer" onClick={toggleSidebar}>
      <IconLayoutSidebar size="20" />
    </button>
  )
}
