"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityRoute, MarkerProps } from "@/types/types";
import { useRouter } from "next/navigation";
import { useRouteStore } from "@/app/stores/useRouteStore";
import CommunityRouteCard from "@/components/community-route-card"
import { favouriteRoute, getCommunityRoutes, getPublicUserRouteFromId, incrementPublicRouteView } from "@/db/routes/routes.service";

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
    const request = await getPublicUserRouteFromId(routeId)
    if (request.publicUserRoute) {
      await incrementPublicRouteView(routeId)
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

  const queryClient = useQueryClient();

  async function handleFavouriteRoute(routeId: string) {
    await favouriteRoute(routeId)
    queryClient.invalidateQueries({ queryKey: ["communityRoutes"] });
  }

  const controls = {
    handleViewRoute,
    handleFavouriteRoute,
  };

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
                  <CommunityRouteCard key={route.routeId} route={route} controls={controls} />
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
