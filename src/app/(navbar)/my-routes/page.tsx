"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { MarkerProps, Route } from "@/types/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { defaultRoute, useRouteStore } from "@/app/stores/useRouteStore";
import { toast } from "sonner";
import MyRouteCard from "@/components/my-route-card"
import { deleteRoute, getUserRouteFromId, getUserRoutes, updateRoutePrivacy } from "@/db/routes/routes.service";

export default function MyRoutes() {
  const router = useRouter();
  const updateRouteState = useRouteStore((s) => s.updateRouteData);

  const { data: routes, isLoading } = useQuery({
    queryKey: ["userRoutes"],
    queryFn: async (): Promise<Route[] | undefined> => {
      const response = await getUserRoutes();

      if (response) {
        return response;
      }
    },
  });

  const queryClient = useQueryClient();

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

  const controls = {
    handleUpdateRoutePrivacy,
    handleDeleteRoute,
    handleEditRoute,
  };

  function createNewRoute() {
    updateRouteState(defaultRoute);
    router.push("/route-editor");
  }

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
          {!isLoading
            ? (
              <>
                {routes?.map((route) => (
                  <MyRouteCard key={route.routeId} route={route} controls={controls} />
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
