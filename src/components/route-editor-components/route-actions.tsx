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
import { defaultRoute, useRouteStore } from "@/app/stores/useRouteStore";
import { saveRoute } from "@/db/database";
import { ToastVariant } from "@/db/enums";
import { toast } from "sonner";

export default function RouteActions() {
  const updateRouteState = useRouteStore((s) => s.updateRouteData);
  const route = useRouteStore((s) => s);

  function handleResetRoute() {
    updateRouteState({
      routeJson: [],
      routeStats: { distance: undefined, duration: undefined },
    });
  }

  async function handleSaveRoute() {
    const response = await saveRoute(route);

    switch (response.variant) {
      case ToastVariant.Success:
        toast.success(response.title, {
          description: response.description,
        });
        break;
      case ToastVariant.Destructive:
        toast.error(response.title, {
          description: response.description,
        });
        break;
    }
  }

  function handleCreateNewRoute() {
    updateRouteState(defaultRoute);
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
                onClick={() => handleCreateNewRoute()}
              >
                <Plus className="h-4 w-4" />
                <span>Create New Route</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                className="hover:cursor-pointer"
                onClick={() => handleSaveRoute()}
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
                <span>Clear Route</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
