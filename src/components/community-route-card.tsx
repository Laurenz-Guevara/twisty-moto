import { Button } from "@/components/ui/button";
import { CommunityRoute } from "@/types/types";
import { convertToMiles } from "@/utils/convertToMiles";
import { formatDurationHoursMinutes } from "@/utils/formatDurationHoursMinutes";
import { IconCalendar, IconClock, IconRuler2 } from "@tabler/icons-react";
import { Eye, Heart, MapPin } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MyRouteCardControls {
  handleViewRoute: (routeId: string) => void;
  handleFavouriteRoute: (routeId: string) => void;
};

interface MyRouteCardProps {
  route: CommunityRoute;
  controls: MyRouteCardControls;
};

export default function CommunityRouteCard({ route, controls }: MyRouteCardProps) {
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
        <Separator className="my-4" />
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={route.routeAuthorAvatar || ""} alt={`@${route.routeAuthor}`} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {route.routeAuthor[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-none">{route.routeAuthor}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <IconCalendar className="h-3 w-3" />
              {route.routeCreatedAt.toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "Europe/London",
              })}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{route.routeViews}</span>
              </div>
              <button
                onClick={() => controls.handleFavouriteRoute(route.routeId)}
                className="flex items-center gap-1.5 hover:text-destructive transition-colors hover:cursor-pointer"
              >
                <Heart className={`h-4 w-4 ${route.routeFavourites ? "fill-destructive text-destructive" : ""}`} />
                <span>{route.routeFavourites}</span>
              </button>
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
