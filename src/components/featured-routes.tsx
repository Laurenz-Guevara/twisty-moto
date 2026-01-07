"use client"

import { useRouteStore } from "@/app/stores/useRouteStore";
import { getFeaturedRoutes, getPublicUserRouteFromId } from "@/db/routes/routes.service";
import { FeaturedRoute, MarkerProps } from "@/types/types";
import { useRouter } from "next/navigation";
import CommunityRouteCard from "@/components/community-route-card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";

export default function FeaturedRoutes() {
  const router = useRouter();
  const updateRouteState = useRouteStore((s) => s.updateRouteData);

  const { data: routes, isLoading } = useQuery({
    queryKey: ["communityRoutes"],
    queryFn: async (): Promise<FeaturedRoute[] | undefined> => {
      const response = await getFeaturedRoutes();

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

  const controls = {
    handleViewRoute,
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&:nth-child(n+3)]:hidden">
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
  )
}

// const featuredRoutes = [
//   {
//     id: 1,
//     title: "Pacific Coast Highway",
//     description:
//       "A stunning coastal ride along California's rugged shoreline with breathtaking ocean views.",
//     location: "California, USA",
//     image: "/placeholder-map.png",
//   },
// ];

function SkeletonForm() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-square w-full h-full rounded-md" />
    </div>
  );
}
