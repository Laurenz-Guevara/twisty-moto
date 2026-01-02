"use client";

import {
  Loader2,
  MousePointerSquareDashed,
} from "lucide-react";
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
import { RouteBuilderVariant, ToastVariant } from "@/db/enums";
import { toast } from "sonner";
import GeoJsonToGpx from "@dwayneparton/geojson-to-gpx"
import { Feature, LineString, Position } from 'geojson';
import { getRouteServerSideRoutes, getGeoJSONServerSide } from "@/db/database";
import { IconDownload, IconFileCheck, IconFileUpload, IconUpload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Dropzone, { FileRejection } from "react-dropzone";
import { simplify } from "@turf/simplify";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { gpx } from "@tmcw/togeojson";
import { MarkerProps } from "react-map-gl/mapbox";

const MAX_FILES = 10

export default function RouteActions() {
  const updateRouteState = useRouteStore((s) => s.updateRouteData);
  const route = useRouteStore((s) => s);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [hasDroppedFile, setHasDroppedFile] = useState<boolean>(false);
  const [isConvertingToRoute, setIsConvertingToRoute] = useState<boolean>(false);
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);

  function determineType(idx: number, totalWaypoints: number) {
    if (idx === 0) {
      return RouteBuilderVariant.Start;
    } else if (idx === (totalWaypoints - 1)) {
      return RouteBuilderVariant.Destination;
    } else {
      return RouteBuilderVariant.Via;
    }
  }

  async function handleImportRoute() {
    if (acceptedFiles.length < 1) return;


    for (const file of acceptedFiles) {
      const text = await file.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");

      const converted = gpx(xml);
      console.log("CON", converted)

      const simplifiedFeature = simplify(
        converted,
        {
          tolerance: 0.25, highQuality: true
        }
      );
      console.log(`Converted GPX for file ${file.name}:`, converted);

      const coord = simplifiedFeature.features[0].geometry.coordinates

      console.log("COORD", coord)

      const gpxRoute = await getGeoJSONServerSide(coord)

      const totalWaypoints = gpxRoute.waypoints.length;
      const cway: MarkerProps[] = gpxRoute.waypoints.map(
        (waypoint: Waypoint, idx: number) => {
          return {
            order: idx,
            latitude: waypoint.location[1],
            longitude: waypoint.location[0],
            streetName: waypoint.name.length !== 0
              ? waypoint.name
              : `${waypoint.location[1]}, ${waypoint.location[0]}`,
            type: determineType(idx, totalWaypoints),
          };
        },
      );

      updateRouteState({ routeJson: cway });

    }
  }

  function clearFiles() {
    setHasDroppedFile(false)
    setAcceptedFiles([])
  }

  const onDropRejected = (rejectedFiles: FileRejection[]) => {
    const [file] = rejectedFiles;

    setIsDragOver(false);
    setHasDroppedFile(false)

    if (rejectedFiles.length > MAX_FILES) {
      toast.error(
        `File limit exceeded`,
        {
          description: "You cannot upload more than 10 files at once.",
        },
      );
    } else {
      toast.error(
        `${file.file.type} type is not supported`,
        {
          description: "Please upload a .GPX file instead.",
        },
      );
    }
  };
  const onDropAccepted = (clientAcceptedFile: File[]) => {
    setHasDroppedFile(true)
    setIsDragOver(false);
    setAcceptedFiles(prev => [...prev, ...clientAcceptedFile])
  };

  async function handleExportRoute() {
    const gpxRoute = await getRouteServerSideRoutes(route.routeJson)
    const flatCoordinates: Position[] = [];

    for (const leg of gpxRoute[0].legs) {
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

  // TODO: REMOVE
  useEffect(() => {
    console.log(acceptedFiles)
  }, [acceptedFiles])

  function handleResetRoute() {
    updateRouteState({
      routeJson: [],
      routeStats: { distance: undefined, duration: undefined },
    });
  }

  async function handleSaveRoute() {
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
            <SidebarMenuSubItem>
              <Dialog>
                <form>
                  <DialogTrigger asChild>
                    <SidebarMenuSubButton
                      className="hover:cursor-pointer"
                    >
                      <IconUpload className="h-4 w-4" />
                      <span>Import GPX file</span>
                    </SidebarMenuSubButton>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Select your GPX files to upload</DialogTitle>
                      <DialogDescription>
                        Import up to 10 GPX files at a time
                      </DialogDescription>
                    </DialogHeader>
                    <div
                      className={cn(
                        "relative h-full flex-1 w-full rounded-xl ring-gray-400/25 bg-input/30 my-2 ring-1 ring-inset lg:rounded-2xl flex justify-center flex-col items-center",
                        {
                          "ring-blue-900/25 bg-blue-900/10": isDragOver,
                        },
                      )}
                    >
                      <div className="relative flex flex-1 flex-col items-center justify-center w-full">
                        <Dropzone
                          onDropRejected={onDropRejected}
                          onDropAccepted={onDropAccepted}
                          maxFiles={MAX_FILES}
                          accept={{
                            "file/gpx": [".gpx"],
                          }}
                          onDragEnter={() => setIsDragOver(true)}
                          onDragLeave={() => setIsDragOver(false)}
                        >
                          {({ getRootProps, getInputProps }) => (
                            <div
                              className="h-full w-full flex flex-1 flex-col items-center justify-center py-10"
                              {...getRootProps()}
                            >
                              <input {...getInputProps()} />
                              {isDragOver
                                ? (
                                  <MousePointerSquareDashed className="h-6 w-6 text-zinc-500 mb-2" />
                                )
                                : isConvertingToRoute
                                  ? (
                                    <>
                                      <Loader2 className="animate-spin h-6 w-6 text-zinc-500 mb-2" />
                                      <p>LOADER 2 </p>
                                    </>
                                  )
                                  : <IconFileUpload className="h-6 w-6 text-zinc-500 mb-2" />}
                              <div className="flex flex-col justify-center mb-2 text-sm text-zinc-700">
                                {hasDroppedFile
                                  ? (
                                    <div className="flex flex-col items-center">
                                      <p className="pb-2 text-zinc-500">Files ready</p>
                                      <p className="pb-2 text-zinc-500">Drop more files to upload more</p>
                                    </div>
                                  )
                                  :
                                  isDragOver
                                    ? (
                                      <p>
                                        <span className="font-semibold text-zinc-500">
                                          Drop file&nbsp;
                                        </span>
                                        <span className="text-zinc-500">
                                          to upload
                                        </span>
                                      </p>
                                    )
                                    : (
                                      <p>
                                        <span className="font-semibold text-zinc-500">
                                          Click to upload
                                        </span>
                                        &nbsp;<span className="text-zinc-500">
                                          or drag and drop
                                        </span>
                                      </p>
                                    )}
                              </div>
                            </div>
                          )}
                        </Dropzone>
                      </div>
                    </div>
                    <DialogFooter className="block mt-4">
                      <div className="text-right w-full space-x-2">
                        <Button onClick={() => clearFiles()} className="hover:cursor-pointer" variant="outline">Clear Files</Button>
                        <Button onClick={() => handleImportRoute()} disabled={!hasDroppedFile} className="bg-green-400/60 hover:cursor-pointer" variant="outline">Import Routes</Button>
                      </div>
                      {acceptedFiles.length > 0 &&
                        <div className="mt-2 space-y-1">
                          <p className="">Files Awaiting Import</p>
                          {acceptedFiles.map((file, index) => (
                            <div className="text-green-400/60 items-center flex space-x-1.5" key={index}>
                              <IconFileCheck size={18} />
                              <p>{file.name}</p>
                            </div>
                          ))}
                        </div>
                      }
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
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
