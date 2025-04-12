"use client";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  ChevronRight,
  Flag,
  // MapPin,
  Plus,
  RefreshCcw,
  Save,
  // Share2,
  X,
} from "lucide-react";

export function RouteAction() {
  function setRouteName(e: string) {
    console.log("Set Route Name", e);
  }

  function setRouteDescription(e: string) {
    console.log("Set Route Description", e);
  }

  return (
    <>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Route Editor</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible
                asChild
                defaultOpen={true}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <span>Actions</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => console.log("Create New Route")}
                        >
                          <Plus className="h-4 w-4" />
                          <span>Create New Route</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => console.log("Save Route")}
                        >
                          <Save className="h-4 w-4" />
                          <span>Save Route</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => console.log("Reset Route")}
                        >
                          <RefreshCcw className="h-4 w-4" />
                          <span>Reset Route</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/*   <SidebarMenuItem> */}
              {/*     <SidebarMenuButton */}
              {/*       onClick={() => console.log("Create New Route")} */}
              {/*       tooltip="Create New Route" */}
              {/*     > */}
              {/*       <Plus className="h-4 w-4" /> */}
              {/*       <span>Create New Route</span> */}
              {/*     </SidebarMenuButton> */}
              {/*   </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="space-y-4 p-2">
              <div className="space-y-2">
                <Label htmlFor="route-name">Route Name</Label>
                <Input
                  id="route-name"
                  value={"Route Name"}
                  onChange={(e) => setRouteName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="route-description">Description</Label>
                <Textarea
                  id="route-description"
                  value={"Route Description..."}
                  onChange={(e) => setRouteDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Route Stats</Label>
                <div className="rounded-md border py-2 px-4 text-sm">
                  <div className="flex justify-between py-1">
                    <span>Distance:</span>
                    <span className="font-medium">0.0 km</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Est. Time:</span>
                    <span className="font-medium">0h 0m</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Elevation Gain:</span>
                    <span className="font-medium">0 m</span>
                  </div>
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            <div className="bg-secondary">
              <div className="flex p-2 justify-between">
                <div className="flex flex-row space-x-2 items-center">
                  <Flag />
                  <span>Newport, Isle of Wight</span>
                </div>
                <X />
              </div>
              <Separator />
              <div className="flex p-2 justify-between">
                <div className="flex flex-row space-x-2 items-center">
                  <span className="text-lg pl-1">1</span>
                  <span>Newport, Isle of Wight</span>
                </div>
                <X />
              </div>
              <Separator />
              <div className="flex p-2 justify-between">
                <div className="flex flex-row space-x-2 items-center">
                  <span className="text-lg pl-1">2</span>
                  <span>Newport, Isle of Wight</span>
                </div>
                <X />
              </div>
              <Separator />
              <div className="flex p-2 justify-between">
                <div className="flex flex-row space-x-2 items-center">
                  <Flag />
                  <span>Newport, Isle of Wight</span>
                </div>
                <X />
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
