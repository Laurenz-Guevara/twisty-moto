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
import { ChevronRight, Loader, Plus, RefreshCcw, Save } from "lucide-react";
import { defaultRoute, useRouteStore } from "@/app/stores/useRouteStore";
import { RouteType, ToastVariant } from "@/enums/enums";
import { toast } from "sonner";
import GeoJsonToGpx from "@dwayneparton/geojson-to-gpx"
import { Feature, LineString, Position } from 'geojson';
import { IconDownload } from "@tabler/icons-react";
import { getDirections } from "@/lib/map-service";
import { saveRoute } from "@/db/routes/routes.service";
import { useState } from "react";

export default function RouteActions() {
  const [isSaving, setIsSaving] = useState(false);
  const updateRouteState = useRouteStore((s) => s.updateRouteData);
  const route = useRouteStore((s) => s);

  async function handleExportRoute() {
    const gpxRoute = await getDirections({ coordinates: route.routeJson, routeType: RouteType.MarkerProps })
    const flatCoordinates: Position[] = [];

    for (const leg of gpxRoute.routes[0].legs) {
      for (const step of leg.steps) {
        if (step.geometry?.coordinates) {
          for (const coord of step.geometry.coordinates) {
            flatCoordinates.push(coord as Position);
          }
        }
      }
    }

    const options = {
      metadata: {
        name: route.routeName,
      }
    }
    const geojson: Feature<LineString> = {
      type: "Feature",
      properties: {
        name: route.routeLocation,
      },
      geometry: {
        type: "LineString",
        coordinates: flatCoordinates,
      },
    };

    const gpx = GeoJsonToGpx(geojson, options);
    const gpxString = new XMLSerializer().serializeToString(gpx);

    const blob = new Blob([gpxString], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${route.routeName}.gpx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function handleResetRoute() {
    updateRouteState({
      routeJson: [],
      routeStats: { distance: undefined, duration: undefined },
    });
  }

  async function handleSaveRoute() {
    setIsSaving(true)
    if (route.routeJson.length <= 1) {
      toast.warning("Warning", {
        description:
          "A route must have at least a start and destination before you are able to save it.",
      });
      return;
    }
    const response = await saveRoute(route, route.routeId);

    switch (response.variant) {
      case ToastVariant.Success:
        toast.success(response.title, {
          description: response.description,
        });
        updateRouteState({ routeId: response.routeId });
        break;

      case ToastVariant.Destructive:
        toast.error(response.title, {
          description: response.description,
        });
        break;

      case ToastVariant.Warning:
        toast.warning(response.title, {
          description: response.description,
        });
        break;
    }
    setIsSaving(false)
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
              <SidebarMenuSubButton asChild>
                <button
                  className="w-full"
                  onClick={handleSaveRoute}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isSaving ? "Saving..." : "Save Route"}</span>
                </button>
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
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                className="hover:cursor-pointer"
                onClick={() => handleExportRoute()}
              >
                <IconDownload className="h-4 w-4" />
                <span>Export to GPX file</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>

          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
