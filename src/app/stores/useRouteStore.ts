import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MarkerProps, StatsProp } from "@/db/types";

export type RouteData = {
  routeName: string;
  routeDescription: string;
  routeJson: Array<MarkerProps>;
  routeStats: StatsProp;
};

export const defaultRoute: RouteData = {
  routeName: "Unnamed Route",
  routeDescription: "",
  routeJson: [],
  routeStats: { duration: undefined, distance: undefined },
};

type RouteStore = RouteData & {
  setRouteData: (data: RouteData) => void;
  updateRouteData: (data: Partial<RouteData>) => void;
  resetRouteData: () => void;
};

export const useRouteStore = create<RouteStore>()(
  persist(
    (set) => ({
      ...defaultRoute,
      setRouteData: (data) =>
        set(() => ({
          routeName: data.routeName,
          description: data.routeDescription,
          routeJson: data.routeJson,
          routeStats: data.routeStats,
        })),
      updateRouteData: (partial) => set((state) => ({ ...state, ...partial })),
      resetRouteData: () => set(defaultRoute),
    }),
    {
      name: "route-editor-state",
    },
  ),
);
