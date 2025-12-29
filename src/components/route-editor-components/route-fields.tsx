"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useRouteStore } from "@/app/stores/useRouteStore";

export default function RouteFields() {
  const [routeName, setRouteName] = useState("Unnamed Route");
  const [routeDescription, setRouteDescription] = useState("");

  const updateRouteState = useRouteStore((s) => s.updateRouteData);
  const storedRouteName = useRouteStore((s) => s.routeName);
  const storedRouteDescription = useRouteStore((s) => s.routeDescription);

  function onRouteNameBlur() {
    const routeNameToSet = routeName.trim() || "Unnamed Route";
    setRouteName(routeNameToSet);
    updateRouteState({ routeName: routeNameToSet });
  }

  useEffect(() => {
    if (storedRouteName.trim().length <= 0) {
      setRouteName("Unnamed Route");
    } else {
      setRouteName(storedRouteName);
    }
  }, [storedRouteName]);

  function onRouteDescriptionBlur() {
    const routeDescriptionToSet = routeDescription.trim() || "";
    setRouteDescription(routeDescriptionToSet);
    updateRouteState({ routeDescription: routeDescriptionToSet });
  }

  useEffect(() => {
    if (storedRouteDescription.trim().length <= 0) {
      setRouteDescription("");
    } else {
      setRouteDescription(storedRouteDescription);
    }
  }, [storedRouteDescription]);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="route-name">Route Name*</Label>
        <Input
          id="route-name"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          onBlur={onRouteNameBlur}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="route-description">
          Description<span className="text-muted-foreground">
            (optional)
          </span>
        </Label>
        <Textarea
          id="route-description"
          value={routeDescription}
          onChange={(e) => setRouteDescription(e.target.value)}
          onBlur={onRouteDescriptionBlur}
        />
      </div>
    </>
  );
}
