"use client";

import { Separator } from "@/components/ui/separator";
import { useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { MarkerProps, CommunityRoutes as CommunityRoutesResponse } from "@/types/types";
import { useRouter } from "next/navigation";
import { useRouteStore } from "@/app/stores/useRouteStore";
import CommunityRouteCard from "@/components/community-route-card";
import {
  favouriteRoute,
  getCommunityRoutesOnScroll,
  getPublicUserRouteFromId,
  incrementPublicRouteView,
} from "@/db/routes/routes.service";
import { useEffect, useRef } from "react";
import SkeletonForm from "@/components/skeleton-form";

export default function CommunityRoutes() {
  const router = useRouter();
  const updateRouteState = useRouteStore((s) => s.updateRouteData);
  const queryClient = useQueryClient();
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["communityRoutes"],
    queryFn: async ({ pageParam }): Promise<CommunityRoutesResponse> => {
      const response = await getCommunityRoutesOnScroll(pageParam, 8);
      return response;
    },
    initialPageParam: undefined as Date | undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  async function handleViewRoute(routeId: string) {
    const request = await getPublicUserRouteFromId(routeId);
    if (request.publicUserRoute) {
      await incrementPublicRouteView(routeId);

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

  async function handleFavouriteRoute(routeId: string) {
    await favouriteRoute(routeId);
    queryClient.invalidateQueries({ queryKey: ["communityRoutes"] });
  }

  const controls = {
    handleViewRoute,
    handleFavouriteRoute,
  };

  const allRoutes = data?.pages.flatMap(page => page.routes) ?? [];

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
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <SkeletonForm key={i} />
            ))}
          {!isLoading &&
            allRoutes.map((route) => (
              <CommunityRouteCard
                key={route.routeId}
                route={route}
                controls={controls}
              />
            ))}
          {isFetchingNextPage &&
            <SkeletonForm />
          }
        </div>
        {allRoutes.length === 0 && !isLoading && (
          <p className="mt-6">There are no community routes.</p>
        )}
        <div ref={observerTarget} className="h-10" />
      </div>
    </div>
  );
}
