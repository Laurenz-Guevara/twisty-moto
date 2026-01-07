"use client";

import Map, {
  FullscreenControl,
  Layer,
  LayerProps,
  MapRef,
  Marker,
  MarkerDragEvent,
  NavigationControl,
  Popup,
  Source,
} from "react-map-gl/mapbox";
import type { Feature, LineString } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import { IconFlagFilled, IconMapPinFilled } from "@tabler/icons-react";
import { RouteBuilderVariant, RouteType } from "@/enums/enums";
import { useDebounce } from "use-debounce";
import { Search, X } from "lucide-react"
import { nanoid } from "nanoid";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouteStore } from "@/app/stores/useRouteStore";
import { MarkerProps } from "@/types/types";
import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, MapPin, Navigation, Plus } from "lucide-react";
import { useMapStore } from "@/app/stores/useMapStore";
import { getDirections, getFeatureCollection, getSuggestedLocations } from "@/lib/map-service";
import { toast } from "sonner";


const routeStyle: LayerProps = {
  id: "route",
  type: "line",
  layout: {
    "line-join": "round",
    "line-cap": "round",
  },
  paint: {
    "line-color": "#3887be",
    "line-width": 5,
    "line-opacity": 0.75,
  },
};

export default function MapContainer() {
  const storedRouteJson = useRouteStore((s) => s.routeJson);
  const [isDragging, setIsDragging] = useState(false);
  const [popupInfo, setPopupInfo] = useState<
    { lng: number; lat: number } | null
  >(null);

  const mapRef = useRef<MapRef>(null);
  const updateRouteState = useRouteStore((s) => s.updateRouteData);

  const jumpToLocation = useMapStore((s) => s.jumpToLocation);
  const clearJumpToLocation = useMapStore((s) => s.clearJumpToLocation);

  useEffect(() => {
    if (!jumpToLocation || !mapRef.current) return;

    mapRef.current.flyTo({
      center: [jumpToLocation.longitude, jumpToLocation.latitude],
      zoom: 14,
      duration: 2000,
    });

    clearJumpToLocation();
  }, [jumpToLocation, clearJumpToLocation]);

  function determineType(idx: number, totalWaypoints: number) {
    if (idx === 0) {
      return RouteBuilderVariant.Start;
    } else if (idx === (totalWaypoints - 1)) {
      return RouteBuilderVariant.Destination;
    } else {
      return RouteBuilderVariant.Via;
    }
  }

  function pointToSegmentDistance(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dx === 0 && dy === 0) {
      return Math.hypot(px - x1, py - y1);
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));

    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    return Math.hypot(px - closestX, py - closestY);
  }

  const { data: routeState, isError } = useQuery({
    queryKey: ["route", storedRouteJson],
    queryFn: async () => {
      const directions = await getDirections({ coordinates: storedRouteJson, routeType: RouteType.MarkerProps });

      const route = directions.routes[0];
      const geojson: Feature<LineString> = {
        type: "Feature",
        properties: {},
        geometry: route.geometry
      };

      const totalWaypoints = route.waypoints.length;
      const waypoints: MarkerProps[] = route.waypoints.map(
        (waypoint, idx) => {
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

      updateRouteState({
        routeJson: [
          ...waypoints,
        ],
        routeStats: { distance: route.distance, duration: route.duration },
        routeGeoJson: geojson,
      });

      return { data: directions, route: route.geometry, geojson: geojson };
    },
    refetchOnMount: true,
    enabled: storedRouteJson.length >= 2,
  });

  useEffect(() => {
    if (isError) {
      const toastId = toast.error("Error", {
        description: `The route you are attempting to plot may be too long. Please try shortening it.`,
        duration: Infinity,
      });

      return () => {
        toast.dismiss(toastId);
      };
    }
  }, [isError]);

  const handleMapClick = (type: string, lng: number, lat: number) => {
    switch (type) {
      case RouteBuilderVariant.Start:
        const updated = storedRouteJson.map((route) => {
          return {
            ...route,
            order: route.order + 1,
          };
        });
        updateRouteState({
          routeJson: [
            {
              order: 0,
              longitude: lng,
              latitude: lat,
              streetName: "",
              type: RouteBuilderVariant.Start,
            },
            ...updated,
          ],
        });
        break;
      case RouteBuilderVariant.Destination:
        updateRouteState({
          routeJson: [
            ...storedRouteJson,
            {
              order: storedRouteJson.length + 1,
              longitude: lng,
              latitude: lat,
              streetName: "",
              type: RouteBuilderVariant.Destination,
            },
          ],
        });
        break;
      case RouteBuilderVariant.Via: {
        const newLng = lng;
        const newLat = lat;

        let minDistance = Infinity;
        let insertIndex = storedRouteJson.length - 1;

        for (let i = 0; i < storedRouteJson.length - 1; i++) {
          const curr = storedRouteJson[i];
          const next = storedRouteJson[i + 1];
          const distance = pointToSegmentDistance(
            newLng,
            newLat,
            curr.longitude,
            curr.latitude,
            next.longitude,
            next.latitude,
          );

          if (distance < minDistance) {
            minDistance = distance;
            insertIndex = i + 1;
          }
        }

        const viaPoint = {
          order: insertIndex,
          longitude: newLng,
          latitude: newLat,
          streetName: "",
          type: RouteBuilderVariant.Via,
        };

        const updated = [
          ...storedRouteJson.slice(0, insertIndex),
          viaPoint,
          ...storedRouteJson.slice(insertIndex),
        ];

        const ordered = updated.map((pt, i) => ({ ...pt, order: i }));
        updateRouteState({ routeJson: ordered });

        break;
      }
      case RouteBuilderVariant.Bookmark:
        console.log("Open Bookmark Context Sidebar");
        break;
      default:
    }
    setPopupInfo(null);
  };

  const handleMobileControls = useCallback((map: mapboxgl.Map) => {
    let touchTimer: NodeJS.Timeout | null = null;
    let initialTouchPoint: { x: number; y: number } | null = null;
    let initialLngLat: { lng: number; lat: number } | null = null;

    const clearTouchTimer = () => {
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
      initialTouchPoint = null;
      initialLngLat = null;
    };

    const handleTouchStart = (event: mapboxgl.MapTouchEvent) => {
      setPopupInfo(null);
      clearTouchTimer();

      if (isDragging) return;

      initialTouchPoint = event.point;
      initialLngLat = event.lngLat;

      touchTimer = setTimeout(() => {
        if (!initialTouchPoint || !initialLngLat) return;

        const acceptableMoveDistance = 20;
        const didNotMove =
          Math.abs(event.point.x - initialTouchPoint.x) < acceptableMoveDistance &&
          Math.abs(event.point.y - initialTouchPoint.y) < acceptableMoveDistance;

        if (didNotMove && !isDragging) {
          setPopupInfo({
            lng: initialLngLat.lng,
            lat: initialLngLat.lat,
          });
        }
        clearTouchTimer();
      }, 600);
    };

    const handleTouchMove = (event: mapboxgl.MapTouchEvent) => {
      if (touchTimer && initialTouchPoint) {
        const acceptableMoveDistance = 20;
        const hasMoved =
          Math.abs(event.point.x - initialTouchPoint.x) >= acceptableMoveDistance ||
          Math.abs(event.point.y - initialTouchPoint.y) >= acceptableMoveDistance;

        if (hasMoved) {
          clearTouchTimer();
        }
      }
    };

    map.on("touchstart", handleTouchStart);
    map.on("touchmove", handleTouchMove);
    map.on("touchend", clearTouchTimer);
    map.on("touchcancel", clearTouchTimer);
    map.on("dragstart", clearTouchTimer);

    return () => {
      map.off("touchstart", handleTouchStart);
      map.off("touchmove", handleTouchMove);
      map.off("touchend", clearTouchTimer);
      map.off("touchcancel", clearTouchTimer);
      map.off("dragstart", clearTouchTimer);
    };
  }, [isDragging]);

  const handleMoveMarker = useCallback(
    (event: MarkerDragEvent, order: number) => {
      const { lng, lat } = event.lngLat;

      const updatedMarkers = storedRouteJson.map((waypoint) =>
        waypoint.order === order
          ? {
            ...waypoint,
            longitude: lng,
            latitude: lat,
          }
          : waypoint
      );

      updateRouteState({
        routeJson: updatedMarkers,
      });
    },
    [storedRouteJson, updateRouteState]
  );


  const markers = useMemo(
    () =>
      storedRouteJson.map((marker) => (
        <Marker
          key={marker.order}
          draggable
          onDragEnd={(e) => handleMoveMarker(e, marker.order)}
          longitude={marker.longitude}
          latitude={marker.latitude}
          anchor="bottom"
        >
          {marker.order === 0 && (
            <IconMapPinFilled size={40} className="text-red-500" />
          )}

          {marker.order === storedRouteJson.length - 1 &&
            marker.order !== 0 && (
              <IconFlagFilled
                size={40}
                className="text-red-500 ml-6 mb-[-4px]"
              />
            )}

          {marker.order !== 0 &&
            marker.order !== storedRouteJson.length - 1 && (
              <IconMapPinFilled size={30} className="text-blue-500" />
            )}
        </Marker>
      )),
    [storedRouteJson, handleMoveMarker]
  );

  const hasRoute = storedRouteJson.length > 0;

  const initialViewState = hasRoute
    ? {
      longitude: storedRouteJson[0].longitude,
      latitude: storedRouteJson[0].latitude,
      zoom: 14,
    }
    : {
      longitude: -1.3,
      latitude: 50.7,
      zoom: 10,
    };

  return (
    <Map
      mapboxAccessToken={process.env
        .NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      onLoad={() => {
        const map = mapRef.current?.getMap();
        if (!map) return;
        handleMobileControls(map);
      }}
      ref={mapRef}
      initialViewState={initialViewState}
      onContextMenu={(e) => {
        e.preventDefault();
        const { lng, lat } = e.lngLat;
        setPopupInfo({ lng, lat });
      }}
      onDrag={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      cursor={isDragging ? "grab" : "default"}
    >
      {storedRouteJson.length >= 2 && routeState?.route && (
        <Source id="my-data" type="geojson" data={routeState.route}>
          <Layer {...routeStyle} />
        </Source>
      )}
      <MapSearchBox />
      {popupInfo && (
        <Popup
          longitude={popupInfo.lng}
          latitude={popupInfo.lat}
          onClose={() => setPopupInfo(null)}
          closeOnClick={true}
          anchor="bottom"
          className="text-black"
        >
          <Card className="w-full max-w-sm border-b-0 p-0 overflow-hidden">
            <CardContent className="p-0 flex flex-col">
              <Button
                className="rounded-t-lg flex justify-start rounded-b-none w-full text-sm hover:cursor-pointer"
                variant="ghost"
                onClick={() =>
                  handleMapClick(
                    RouteBuilderVariant.Start,
                    popupInfo.lng,
                    popupInfo.lat,
                  )}
              >
                <Navigation className="w-4 h-4" />
                <span>
                  Set as start
                </span>
              </Button>
              <Button
                variant="ghost"
                className="rounded-none flex justify-start rounded-b-none w-full text-sm hover:cursor-pointer"
                onClick={() =>
                  handleMapClick(
                    RouteBuilderVariant.Via,
                    popupInfo.lng,
                    popupInfo.lat,
                  )}
              >
                <Plus className="w-4 h-4" />
                <span>
                  Create via point
                </span>
              </Button>
              <Button
                variant="ghost"
                className="rounded-none flex justify-start rounded-b-none w-full text-sm hover:cursor-pointer"
                onClick={() =>
                  handleMapClick(
                    RouteBuilderVariant.Destination,
                    popupInfo.lng,
                    popupInfo.lat,
                  )}
              >
                <MapPin className="w-4 h-4" />
                <span>
                  Set as destination
                </span>
              </Button>
              <div className="border-t border-border" />
              <Button
                variant="ghost"
                className="rounded-t-none flex justify-start w-full text-sm hover:cursor-pointer"
                onClick={() =>
                  handleMapClick(
                    RouteBuilderVariant.Bookmark,
                    popupInfo.lng,
                    popupInfo.lat,
                  )}
              >
                <Bookmark className="w-4 h-4" />
                <span>Bookmark Location</span>
              </Button>
            </CardContent>
          </Card>
        </Popup>
      )}
      {markers}
      <NavigationControl />
      <FullscreenControl />
    </Map>
  );
}

const DEBOUNCE_DELAY = 500

function MapSearchBox() {
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch] = useDebounce(searchInput, DEBOUNCE_DELAY);
  const sessionTokenRef = useRef<string>(nanoid());

  const { data: suggestedLocationsResponse, isPending, isError } = useQuery({
    queryKey: ["suggestedLocations", debouncedSearch],
    queryFn: () => getSuggestedLocations(debouncedSearch, sessionTokenRef.current),
    enabled: debouncedSearch.length > 0,
    retry: false,
  });

  async function jumpToLocation(mapboxId: string) {
    const geojson = await getFeatureCollection(mapboxId, sessionTokenRef.current)
    const [longitude, latitude] = geojson.features[0].geometry.coordinates
    useMapStore.getState().setJumpToLocation({
      latitude,
      longitude,
    })
  }

  return (
    <div className="relative grid w-full max-w-lg gap-2 mt-4 ml-4 pr-16">
      <InputGroup className="shadow text-black mode-light">
        <InputGroupInput className="overflow-ellipsis" onChange={(e) => setSearchInput(e.target.value)} value={searchInput} placeholder="Search..." />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        {((searchInput.length > 0 && suggestedLocationsResponse?.suggestions?.length === 0) || isError) && (
          <InputGroupAddon className="pr-0" align="inline-end">
            0 results
          </InputGroupAddon>
        )}
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            className="hover:cursor-pointer bg-transparent!"
            variant="ghost"
            aria-label="clear"
            size="icon-sm"
            onClick={() => setSearchInput("")}
          >
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <div className="rounded-md bg-white shadow overflow-hidden mode-light">
        {searchInput.length > 0 && suggestedLocationsResponse?.suggestions?.map((suggestion) => (
          <div key={suggestion.mapbox_id} onClick={() => jumpToLocation(suggestion.mapbox_id)} className="pl-3 py-1.5 hover:bg-muted hover:cursor-pointer">
            <p>{suggestion.name}</p>
            <p className="text-muted-foreground">{suggestion.place_formatted}</p>
          </div>
        ))}
        {isPending && searchInput.length > 0 && (
          <div className="pl-3 py-1.5">
            <p>Searching...</p>
          </div>
        )}
      </div>
    </div>
  )
}
