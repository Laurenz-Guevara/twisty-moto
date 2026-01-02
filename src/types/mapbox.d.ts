import 'mapbox-sdk/services/directions';
import type { GeoJSON } from 'geojson';

// Reason this has been added in is that currently the Mapbox Directions API returns waypoints when waypoints_per_route=true
// it is not reflected / updated in the types as it should currently be. As of 02/01/2026
declare module '@mapbox/mapbox-sdk/services/directions' {
  interface Route<T extends GeoJSON.LineString = GeoJSON.LineString> {  // eslint-disable-line @typescript-eslint/no-unused-vars
    waypoints: {
      distance: number;
      name: string;
      location: [number, number];
    }[];
  }
}
