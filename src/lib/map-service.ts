import { RouteType } from '@/db/enums';
import { MarkerProps } from '@/db/types';
import { DirectionsResponse } from '@mapbox/mapbox-sdk/services/directions';
import { Coordinates } from "@mapbox/mapbox-sdk/services/geocoding-v6";

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
