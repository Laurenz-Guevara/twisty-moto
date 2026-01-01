import { Button } from "@/components/ui/button";
import { Route } from "@/db/types";
import { MapPin } from "lucide-react";
import Image from "next/image";

interface MyRouteCardControls {
  handleViewRoute: (routeId: string) => void;
};

interface MyRouteCardProps {
  route: Route;
  controls: MyRouteCardControls;
};

export default function CommunityRouteCard({ route, controls }: MyRouteCardProps) {

  return (
    <div
      key={route.routeId}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md"
    >
      <div className="aspect-video overflow-hidden h-full">
        <Image
          src={route.routeImage || "/placeholder-map.png"}
          alt={route.routeName}
          width={400}
          height={300}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4 h-3/4 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold">{route.routeName}</h3>
          {route.routeLocation &&
            (
              <div className="mt-1 flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {route.routeLocation.routeStartPlace} - {route.routeLocation.routeDestinationPlace}
              </div>
            )
          }
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {route.routeDescription}
          </p>
        </div>

        <div className="flex space-x-2 items-center justify-between mt-2">
          <div className="space-x-2">
            <Button
              onClick={() => controls.handleViewRoute(route.routeId)}
              className="hover:cursor-pointer"
              variant="outline"
              size="sm"
            >
              View Route
            </Button>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground text-nowrap overflow-ellipsis">
            Created by {route.routeAuthor}
          </p>
        </div>
      </div>
    </div>

  )
}
