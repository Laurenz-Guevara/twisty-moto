"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const Map = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    console.log("hi", mapContainerRef);
    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      center: [-1, 51],
      attributionControl: true,
      zoom: 7.8,
    });

    const resizeMap = () => {
      if (map) setTimeout(() => map.resize(), 700);
    };
    resizeMap();

    return () => map.remove();
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
