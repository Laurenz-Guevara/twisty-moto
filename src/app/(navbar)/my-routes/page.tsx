"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { MarkerProps, UserRoutes as UserRoutesResponse } from "@/types/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { defaultRoute, useRouteStore } from "@/app/stores/useRouteStore";
import { toast } from "sonner";
import MyRouteCard from "@/components/my-route-card"
import { deleteRoute, favouriteRoute, getUserRouteFromId, getUserRoutes, updateRoutePrivacy } from "@/db/routes/routes.service";
import { useEffect, useRef } from "react";
import SkeletonForm from "@/components/skeleton-form";

export default function MyRoutes() {
  const router = useRouter();
  const updateRouteState = useRouteStore((s) => s.updateRouteData);
  const queryClient = useQueryClient();
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["userRoutes"],
    queryFn: async ({ pageParam }): Promise<UserRoutesResponse> => {
      const response = await getUserRoutes(pageParam, 8);
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

  async function handleUpdateRoutePrivacy(routeId: string, isPublic: boolean) {
    await updateRoutePrivacy(routeId, isPublic);
    queryClient.invalidateQueries({ queryKey: ["userRoutes"] });
  }

  async function handleDeleteRoute(routeId: string) {
    await deleteRoute(routeId);
    queryClient.invalidateQueries({ queryKey: ["userRoutes"] });
  }

  async function handleEditRoute(routeId: string) {
    const request = await getUserRouteFromId(routeId);

    if (request.userRoute) {
      const userRoute = request.userRoute[0];
      updateRouteState({
        routeId: userRoute.routeId,
        routeName: userRoute.routeName,
        routeDescription: userRoute.routeDescription,
        routeJson: userRoute.routeState as MarkerProps[],
      });

      router.push("/route-editor");
    } else {
      toast.error(
        request.title,
        {
          description: request.description,
        },
      );
    }
  }

  async function handleFavouriteRoute(routeId: string) {
    await favouriteRoute(routeId)
    queryClient.invalidateQueries({ queryKey: ["userRoutes"] });
  }

  const controls = {
    handleUpdateRoutePrivacy,
    handleDeleteRoute,
    handleEditRoute,
    handleFavouriteRoute,
  };

  function createNewRoute() {
    updateRouteState(defaultRoute);
    router.push("/route-editor");
  }

  const allRoutes = data?.pages.flatMap(page => page.routes) ?? [];

  return (
    <div className="container mx-auto">
      <div className="space-y-6 py-10 px-7 pb-16">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">
              My Routes
            </h2>
            <p className="text-muted-foreground">
              A collection of all the routes you built.
            </p>
          </div>
          <Button
            variant="outline"
            className="hover:cursor-pointer mt-4 sm:mt-0"
            onClick={() => createNewRoute()}
          >
            <Plus />
            <span>Create New Route</span>
          </Button>
        </div>
        <Separator className="my-6" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <SkeletonForm key={i} />
            ))}
          {!isLoading &&
            allRoutes.map((route) => (
              <MyRouteCard key={route.routeId} route={route} controls={controls} />
            ))}
          {isFetchingNextPage &&
            <SkeletonForm />
          }
          {allRoutes.length === 0 && !isLoading && (
            <Button
              asChild
              className="aspect-square w-full h-full rounded-md hover:cursor-pointer"
            >
              <Link href="route-editor">
                Create your first route.
              </Link>
            </Button>
          )}
        </div>
        <div ref={observerTarget} className="h-10" />
      </div>
    </div>
  );
}
