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
import { useEffect, useRef, useState } from "react";
import SkeletonForm from "@/components/skeleton-form";
import FilterRoutes from "@/components/filter-routes";
import { FilterVariant, SortVariant } from "@/enums/enums";

export default function CommunityRoutes() {
  const router = useRouter();
  const updateRouteState = useRouteStore((s) => s.updateRouteData);
  const queryClient = useQueryClient();
  const observerTarget = useRef<HTMLDivElement>(null);
  const [distanceRange, setDistanceRange] = useState<[number, number]>([0, 1000]);
  const [filter, setFilter] = useState<string>(FilterVariant.DateCreated);
  const [sort, setSort] = useState<string>(SortVariant.Ascending);
  const [search, setSearch] = useState<string>("");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["communityRoutes", filter, sort, distanceRange, search],
    queryFn: async ({ pageParam }): Promise<CommunityRoutesResponse> => {
      const offset = pageParam ?? 0;
      const response = await getCommunityRoutesOnScroll(offset, 8, filter, sort, distanceRange, search);
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length * 8;
    },
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

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
  };

  const handleDistanceChange = (newRange: [number, number]) => {
    setDistanceRange(newRange);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
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
        <FilterRoutes
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onDistanceRangeChange={handleDistanceChange}
          onSearchChange={handleSearchChange}
        />
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
