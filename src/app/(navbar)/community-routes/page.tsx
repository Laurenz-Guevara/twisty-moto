"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCommunityRoutes, getPublicUserRouteFromId } from "@/db/database";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { CommunityRoute, MarkerProps } from "@/db/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRouteStore } from "@/app/stores/useRouteStore";

export default function CommunityRoutes() {
  const router = useRouter();
  const updateRouteState = useRouteStore((s) => s.updateRouteData);
  const { data: routes, isLoading } = useQuery({
    queryKey: ["communityRoutes"],
    queryFn: async (): Promise<CommunityRoute[] | undefined> => {
      const response = await getCommunityRoutes();

      if (response) {
        return response;
      }
    },
  });

  async function handleViewRoute(routeId: string) {
    const request = await getPublicUserRouteFromId(routeId);

    if (request.publicUserRoute) {
      const userRoute = request.publicUserRoute[0];
      updateRouteState({
        routeId: userRoute.routeId,
        routeName: userRoute.routeName,
        routeDescription: userRoute.routeDescription,
        routeJson: userRoute.routeState as MarkerProps[],
      });

      router.push("/route-editor");
    }
  }

  return (
    <div className="container mx-auto">
      <div className="space-y-6 py-10 px-7 pb-16">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            Community Routes
          </h2>
          <p className="text-muted-foreground">
            A collection of all the routes built by the community.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {!isLoading
            ? (
              <>
                {routes?.map((route) => (
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
                            onClick={() => handleViewRoute(route.routeId)}
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
                ))}
              </>
            )
            : (
              <>
                <SkeletonForm />
                <SkeletonForm />
                <SkeletonForm />
                <SkeletonForm />
                <SkeletonForm />
                <SkeletonForm />
                <SkeletonForm />
                <SkeletonForm />
              </>
            )}
          {routes?.length === 0 && !isLoading && (
            <p>There are no community routes.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonForm() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-square w-full h-full rounded-md" />
    </div>
  );
}
