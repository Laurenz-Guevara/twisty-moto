import { Route } from "@/db/types";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconClock, IconEdit, IconEye, IconEyeOff, IconLock, IconRuler2, IconTrash, IconWorld } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MyRouteCardControls {
  handleUpdateRoutePrivacy: (routeId: string, isPublic: boolean) => void;
  handleDeleteRoute: (routeId: string) => void;
  handleEditRoute: (routeId: string) => void;
};

interface MyRouteCardProps {
  route: Route;
  controls: MyRouteCardControls;
};

export default function MyRouteCard({ route, controls }: MyRouteCardProps) {
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
              <span>233 Miles</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconClock className="h-4 w-4 shrink-0" />
              <span>1 hour</span>
            </div>
          </div>

        </div>
        <div className="flex flex-wrap gap-2 w-full mt-3">
          <Button
            variant="outline"
            className="hover:cursor-pointer flex-1"
            size="sm"
            onClick={() => controls.handleEditRoute(route.routeId)}
          >
            <IconEdit />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="hover:cursor-pointer flex-1 hover:bg-destructive"
                size="sm"
              >
                <IconTrash />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will
                  permanently delete your route.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="hover:cursor-pointer bg-destructive text-white"
                  onClick={() =>
                    controls.handleDeleteRoute(route.routeId)}
                >
                  <IconTrash />
                  Confirm Delete Route
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="outline"
            size="sm"
            className={cn("hover:cursor-pointer flex-1", {
              "bg-green-400/60": route.isPublic
            })}
            onClick={() =>
              controls.handleUpdateRoutePrivacy(
                route.routeId,
                !route.isPublic,
              )}

          >
            {route.isPublic ? (
              <>
                <IconWorld className="h-4 w-4" />
                Public
              </>
            ) : (
              <>
                <IconLock className="h-4 w-4" />
                Private
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
