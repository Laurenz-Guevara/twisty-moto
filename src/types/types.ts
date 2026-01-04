export interface User {
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: Date;
  read: boolean;
  category: string;
  priority: string;
  actionLabel: string;
  actionUrl: string;
}

export interface RouteLocation {
  routeStartPlace: string,
  routeDestinationPlace: string,
}

export interface MarkerProps {
  order: number;
  latitude: number;
  longitude: number;
  streetName: string;
  type: string;
}

export interface Waypoint {
  distance: number;
  location: number[];
  name: string;
  type: string;
}

export interface StatsProp {
  distance: number | undefined;
  duration: number | undefined;
}

export interface BaseRoute {
  routeId: string;
  routeName: string;
  routeAuthor: string;
  routeLocation: RouteLocation;
  routeImage?: string;
  routeDescription?: string;
  routeCompletionTime: number;
  routeDistance: number;
}

export interface Route extends BaseRoute {
  isPublic: boolean;
}

export type CommunityRoute = BaseRoute;
