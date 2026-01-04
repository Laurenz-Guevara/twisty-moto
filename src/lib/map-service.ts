import { RouteType } from '@/enums/enums';
import { MarkerProps } from '@/types/types';
import { DirectionsResponse } from '@mapbox/mapbox-sdk/services/directions';
import { Coordinates } from "@mapbox/mapbox-sdk/services/geocoding-v6";
import { GeocodingResponse, SearchBoxSuggestionResponse } from '@mapbox/search-js-core';
import type { FeatureCollection, Point } from "geojson";

interface GetDirectionRouteParams {
  coordinates: MarkerProps[] | Coordinates[];
  routeType: RouteType.MarkerProps | RouteType.Coordinates;
}

function waypointFactory({ coordinates, routeType, }: GetDirectionRouteParams): string {
  switch (routeType) {
    case RouteType.MarkerProps:
      return (coordinates as MarkerProps[])
        .sort((a, b) => a.order - b.order)
        .map((pt) => `${pt.longitude},${pt.latitude}`)
        .join(';');

    case RouteType.Coordinates:
      return (coordinates as Coordinates[])
        .map((pt) => `${pt.longitude},${pt.latitude}`)
        .join(';');

    default:
      throw new Error('Invalid route type');
  }
}

export async function getDirections({ coordinates, routeType }: GetDirectionRouteParams) {
  const waypoints = waypointFactory({ coordinates: coordinates, routeType: routeType })

  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?steps=true&waypoints_per_route=true&geometries=geojson&overview=full&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
  );
  if (response.ok) {
    return await response.json() as DirectionsResponse<GeoJSON.LineString>;
  } else {
    throw new Error("Cannot get route")
  }
}

async function reverseGeocode([longitude, latitude]: number[]): Promise<string> {
  const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error("Failed to reverse geocode coordinates")
  }

  const featureCollection: GeocodingResponse = await res.json()

  if (!featureCollection.features?.length) {
    throw new Error("No geocoding results found")
  }

  if (!featureCollection.features[0].properties.context.place?.name) {
    return featureCollection.features[0].properties.place_formatted
  }

  return featureCollection.features[0].properties.context.place.name
}

export async function getRegionFromCoordinates({
  routeStartPlace,
  routeDestinationPlace,
}: {
  routeStartPlace: [number, number]
  routeDestinationPlace: [number, number]
}): Promise<string[]> {
  const [startRegion, destinationRegion] = await Promise.all([
    reverseGeocode(routeStartPlace),
    reverseGeocode(routeDestinationPlace),
  ])

  return [startRegion, destinationRegion]
}


export async function getFeatureCollection(mapbox_id: string, sessionTokenRef: string): Promise<FeatureCollection<Point>> {
  const response = await fetch(`https://api.mapbox.com/search/searchbox/v1/retrieve/${mapbox_id}?&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&session_token=${sessionTokenRef}`)
  return await response.json()
}

export async function getSuggestedLocations(searchInput: string, sessionTokenRef: string): Promise<SearchBoxSuggestionResponse> {
  const response = await fetch(`https://api.mapbox.com/search/searchbox/v1/suggest?q=${searchInput}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&session_token=${sessionTokenRef}&language=en&limit=10`)
  if (!response.ok) {
    throw new Error("Request failed")
  }
  return await response.json()
}
