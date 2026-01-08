import { Button } from "@/components/ui/button";
import { FeaturedRoute } from "@/types/types";
import { convertToMiles } from "@/utils/convertToMiles";
import { formatDurationHoursMinutes } from "@/utils/formatDurationHoursMinutes";
import { IconClock, IconRuler2 } from "@tabler/icons-react";
import { MapPin } from "lucide-react";
import Image from "next/image";

interface MyRouteCardControls {
  handleViewRoute: (routeId: string) => void;
};

interface MyRouteCardProps {
  route: FeaturedRoute;
  controls: MyRouteCardControls;
};

export default function FeaturedRouteCard({ route, controls }: MyRouteCardProps) {

  return (
    <div
      key={route.routeId}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-primary-foreground shadow-sm transition-all hover:shadow-md"
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
        <div className="space-y-2">
          <h3 className="font-semibold">{route.routeName}</h3>
          {
            route.routeDescription && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {route.routeDescription}
              </p>
            )
          }
          {route.routeLocation &&
            (
              <div className="mt-1 flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {route.routeLocation.routeStartPlace === route.routeLocation.routeDestinationPlace ? (
                  route.routeLocation.routeStartPlace
                ) : (
                  `${route.routeLocation.routeStartPlace} - ${route.routeLocation.routeDestinationPlace}`
                )}
              </div>
            )}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconRuler2 className="h-4 w-4 shrink-0" />
              <span>{convertToMiles(route.routeDistance)} Miles</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconClock className="h-4 w-4 shrink-0" />
              <span>{formatDurationHoursMinutes(route.routeCompletionTime)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full mt-3">
          <Button
            variant="outline"
            size="sm"
            className="hover:cursor-pointer flex-1 hover:bg-green-400/60"
            onClick={() => controls.handleViewRoute(route.routeId)}
          >
            View Route
          </Button>
        </div>
      </div>
    </div>
  )
}

