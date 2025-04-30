"use client";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, Plus, RefreshCcw, Save } from "lucide-react";
import { useRouteStore } from "@/app/stores/useRouteStore";

export default function RouteActions() {
  const updateRouteState = useRouteStore((s) => s.updateRouteData);

  function handleResetRoute() {
    updateRouteState({
      routeJson: [],
      routeStats: { distance: undefined, duration: undefined },
    });
  }

  return (
    <Collapsible
      asChild
      defaultOpen={true}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="hover:cursor-pointer">
            <span>More Actions</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                className="hover:cursor-pointer"
                onClick={() => console.log("Create New Route")}
              >
                <Plus className="h-4 w-4" />
                <span>Create New Route</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                className="hover:cursor-pointer"
                onClick={() => console.log("Save Route")}
              >
                <Save className="h-4 w-4" />
                <span>Save Route</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                className="hover:cursor-pointer"
                onClick={() => handleResetRoute()}
              >
                <RefreshCcw className="h-4 w-4" />
                <span>Reset Route</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
