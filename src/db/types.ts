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

export interface Route {
  routeId: string;
  routeName: string;
  routeLocation: string;
  routeImage: string | undefined;
  routeDescription: string | undefined;
  isPublic: boolean;
}
