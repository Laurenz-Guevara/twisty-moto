import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";

import RouteActions from "@/components/route-editor-components/route-actions";
import RouteFields from "@/components/route-editor-components/route-fields";
import RouteStats from "@/components/route-editor-components/route-stats";
import RouteNavigationList from "@/components/route-editor-components/route-navigation-list";

export function RouteActionSidebarContent() {
  return (
    <>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Route Editor</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <RouteActions />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="space-y-4 p-2">
              <RouteFields />
              <RouteStats />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            <RouteNavigationList />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
