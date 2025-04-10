"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const Map = () => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [center, setCenter] = useState<LngLatLike>([-1, 51]);
  const [zoom, setZoom] = useState(7.8);

  useEffect(() => {
    if (mapContainerRef.current) {
      mapboxgl.accessToken = process.env
        .NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        // style: "mapbox://styles/mapbox/dark-v11",
        center: center,
        zoom: zoom,
      });

      mapRef.current.on("mousedown", (e) => {
        console.log("Clicking");
        console.log("event type:", e);
      });

      mapRef.current.on("drag", (e) => {
        console.log("event type:", e.type);
      });

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
        }
      };
    }
  }, []);

  return (
    <div
      className="relative h-full w-full rounded-xl"
      ref={mapContainerRef}
      style={{
        height: "100%",
        width: "100%",
      }}
    />
  );
};

export default Map;
