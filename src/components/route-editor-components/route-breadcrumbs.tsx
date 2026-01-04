"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useEffect, useRef, useState } from "react";
import { useRouteStore } from "@/app/stores/useRouteStore";

export default function RouteBreadcrumbs() {
  const [routeName, setRouteName] = useState("Unnamed Route");
  const input = useRef<HTMLInputElement>(null);

  const storedRouteName = useRouteStore((s) => s.routeName);
  const updateRouteState = useRouteStore((s) => s.updateRouteData);

  useEffect(() => {
    if (storedRouteName.trim().length <= 0) {
      setRouteName("Unnamed Route");
    } else {
      setRouteName(storedRouteName);
    }
  }, [storedRouteName]);

  function onBlur() {
    const routeNameToSet = routeName.trim() || "Unnamed Route";
    setRouteName(routeNameToSet);
    updateRouteState({ routeName: routeNameToSet });
  }

  return (
    <Breadcrumb className="overflow-hidden">
      <BreadcrumbList className="flex flex-row flex-nowrap text-nowrap">
        <BreadcrumbItem>
          <BreadcrumbLink href="/my-routes">My Routes</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Route Editor</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="flex">
            <input
              className="outline-0 overflow-ellipsis"
              type="text"
              value={routeName}
              onBlur={onBlur}
              onChange={(e) => setRouteName(e.target.value)}
              ref={input}
            />
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
