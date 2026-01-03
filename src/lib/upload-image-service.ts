import { simplify } from "@turf/simplify";
import { nanoid } from "nanoid";
import { utapi } from "@/app/api/uploadthing/core";
import type { FeatureCollection } from "geojson";
import { RouteData } from "@/app/stores/useRouteStore";

const HIGH_ACCURACY_ROUTE_THRESHOLD = 4000
const MEDIUM_ACCURACY_ROUTE_THRESHOLD = 6000
const LOW_ACCURACY_ROUTE_THRESHOLD = 8000
const HIGH_ACCURACY_ROUTE = 0.001
const MEDIUM_ACCURACY_ROUTE = 0.005
const LOW_ACCURACY_ROUTE = 0.010

function determineThumbnailAccuracy(routeLength: number): number {
  if (routeLength < HIGH_ACCURACY_ROUTE_THRESHOLD) {
    return HIGH_ACCURACY_ROUTE
  } else if (routeLength < MEDIUM_ACCURACY_ROUTE_THRESHOLD) {
    return MEDIUM_ACCURACY_ROUTE
  } else if (routeLength < LOW_ACCURACY_ROUTE_THRESHOLD) {
    return LOW_ACCURACY_ROUTE
  } else {
    return LOW_ACCURACY_ROUTE
  }
}

export async function UploadRouteThumbnail(route: RouteData) {
  const simplifiedFeature = simplify(
    route.routeGeoJson,
    {
      tolerance: determineThumbnailAccuracy(route.routeGeoJson.geometry.coordinates.length), highQuality: true
    }
  );
  const payloadGeoJson: FeatureCollection = {
    type: "FeatureCollection",
    features: [simplifiedFeature]
  };
  const encodedGeoJson = encodeURIComponent(JSON.stringify(payloadGeoJson));
  const generatedStaticMapResponse = await fetch(`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/geojson(${encodedGeoJson})/auto/640x360?padding=40&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`)
  const uploadedFile = await utapi.uploadFilesFromUrl({
    url: generatedStaticMapResponse.url,
    name: `${nanoid()}.jpg`,
  });

  return { uploadSuccess: uploadedFile.data, fileUrl: uploadedFile.data?.ufsUrl, fileKey: uploadedFile.data?.key }
}

