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
import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import { SearchBoxSuggestionResponse } from '@mapbox/search-js-core';
import "mapbox-gl/dist/mapbox-gl.css";
import { IconFlagFilled, IconMapPinFilled } from "@tabler/icons-react";
import { RouteBuilderVariant } from "@/db/enums";
import { useDebounce } from "use-debounce";
import { Search, X } from "lucide-react"
import { nanoid } from "nanoid";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouteStore } from "@/app/stores/useRouteStore";
import { MarkerProps, Waypoint } from "@/db/types";
import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, MapPin, Navigation, Plus } from "lucide-react";
import { useMapStore } from "@/app/stores/useMapStore";


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

  // TODO: Check if route is valid otherwise fallback
  const { data: routeState } = useQuery({
    queryKey: ["route", storedRouteJson],
    queryFn: async () => {
      const coords = storedRouteJson
        .sort((a, b) => a.order - b.order)
        .map((pt) => `${pt.longitude},${pt.latitude}`)
        .join(";");

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?steps=true&geometries=geojson&overview=full&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
      );
      const json = await response.json();
      const data = json.routes[0];
      const route: LineString = data.geometry;
      const geojson: Feature<LineString> = {
        type: "Feature",
        properties: {},
        geometry: route
      };

      const totalWaypoints = json.waypoints.length;
      const waypoints: MarkerProps[] = json.waypoints.map(
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

      updateRouteState({
        routeJson: [
          ...waypoints,
        ],
        routeStats: { distance: data.distance, duration: data.duration },
        routeGeoJson: geojson,
      });

      return { data: data, route: route, geojson: geojson };
    },
    refetchOnMount: true,
    enabled: storedRouteJson.length >= 2,
  });

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

  const handleMoveMarker = (event: MarkerDragEvent, order: number) => {
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
  };

  const markers = useMemo(() =>
    storedRouteJson.map((marker) => {
      return (
        <Marker
          key={marker.order}
          draggable={true}
          onDragEnd={(e) => handleMoveMarker(e, marker.order)}
          longitude={marker.longitude}
          latitude={marker.latitude}
          anchor="bottom"
        >
          {marker.order === 0 &&
            <IconMapPinFilled size={40} className="text-red-500" />}
          {marker.order === storedRouteJson.length - 1 && marker.order !== 0 &&
            (
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
      );
    }), [storedRouteJson]);

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

async function getFeatureCollection(mapbox_id: string, sessionTokenRef: string): Promise<FeatureCollection<Point>> {
  const response = await fetch(`https://api.mapbox.com/search/searchbox/v1/retrieve/${mapbox_id}?&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&session_token=${sessionTokenRef}`)
  return await response.json()
}

async function getSuggestedLocations(searchInput: string, sessionTokenRef: string): Promise<SearchBoxSuggestionResponse> {
  const response = await fetch(`https://api.mapbox.com/search/searchbox/v1/suggest?q=${searchInput}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&session_token=${sessionTokenRef}&language=en&limit=10`)
  return await response.json()
}

const DEBOUNCE_DELAY = 500

function MapSearchBox() {
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch] = useDebounce(searchInput, DEBOUNCE_DELAY);
  const sessionTokenRef = useRef<string>(nanoid());

  const { data: suggestedLocationsResponse, isPending: isPending } = useQuery({
    queryKey: ["suggestedLocations", debouncedSearch],
    queryFn: () => getSuggestedLocations(debouncedSearch, sessionTokenRef.current),
    enabled: debouncedSearch.length > 1,
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
    <div className="relative grid w-full max-w-sm gap-2 mt-4 ml-4">
      <InputGroup className="shadow text-black mode-light">
        <InputGroupInput onChange={(e) => setSearchInput(e.target.value)} value={searchInput} placeholder="Search..." />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        {searchInput.length > 1 && suggestedLocationsResponse?.suggestions?.length === 0 && (
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
