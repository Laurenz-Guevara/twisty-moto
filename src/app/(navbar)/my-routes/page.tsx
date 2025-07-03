"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteRoute, getUserRouteFromId, getUserRoutes } from "@/db/database";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { MarkerProps, Route } from "@/db/types";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useRouteStore } from "@/app/stores/useRouteStore";
import { toast } from "sonner";

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

  async function handleDeleteRoute(routeId: string) {
    await deleteRoute(routeId);
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

  return (
    <div className="container mx-auto">
      <div className="space-y-6 py-10 px-7 pb-16">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            My Routes
          </h2>
          <p className="text-muted-foreground">
            A collection of all the routes you built.
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
                    className="group relative overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="aspect-video overflow-hidden">
                      <Image
                        src={route.routeImage || "/placeholder-map.png"}
                        alt={route.routeName}
                        width={400}
                        height={300}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{route.routeName}</h3>
                      <div className="mt-1 flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-4 w-4" />
                        {route.routeLocation}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {route.routeDescription}
                      </p>
                      <div className="flex space-x-2 items-center mt-2">
                        <Button
                          className="hover:cursor-pointer"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRoute(route.routeId)}
                        >
                          Edit Route
                        </Button>
                        <Button
                          className="hover:cursor-pointer"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRoute(route.routeId)}
                        >
                          Delete Route
                        </Button>
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
