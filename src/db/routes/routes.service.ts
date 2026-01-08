"use server"

import { db } from "@/db";
import { favourites, routes } from "@/db/schema";
import { and, AnyColumn, eq, sql } from "drizzle-orm";
import { utapi } from "@/app/api/uploadthing/core";
import { RouteData } from "@/app/stores/useRouteStore";
import { CommunityRoute, FeaturedRoute, MarkerProps, Route, RouteLocation } from "@/types/types";
import { ToastVariant, RouteType } from "@/enums/enums";
import { getDirections, getRegionFromCoordinates } from "@/lib/map-service";
import { UploadRouteThumbnail } from "@/lib/upload-image-service";
import { getUserId, getUsername } from "@/db/auth/session";

export async function getRouteFileKeys(userId: string) {
  const routeImageFileKeys = await db
    .select({
      fileKey: routes.routeImageFileKey,
    })
    .from(routes)
    .where(
      and(
        eq(routes.routeCreator, userId),
      ))
  const routeImageFileKeysCollection = routeImageFileKeys.map(item => item.fileKey);

  return routeImageFileKeysCollection;
}

export const getUserRoutes = async (): Promise<Array<Route>> => {
  const userId = await getUserId();

  if (!userId) throw new Error("No userid");

  const userRoutes = await db
    .select({
      routeId: routes.routeId,
      routeName: routes.routeName,
      routeAuthor: routes.routeAuthor,
      routeLocation: routes.routeLocation,
      routeDescription: routes.routeDescription,
      routeImage: routes.routeImageUrl,
      routeCompletionTime: routes.routeCompletionTime,
      routeDistance: routes.routeDistance,
      isPublic: routes.isPublic,
      routeFavourites: routes.routeFavouriteCount,
      routeViews: routes.routeViews
    })
    .from(routes)
    .where(eq(routes.routeCreator, userId));

  return userRoutes.map(route => ({
    ...route,
    routeLocation: route.routeLocation as RouteLocation
  }));
};

export const getCommunityRoutes = async (): Promise<Array<CommunityRoute>> => {
  const communityRoutes = await db
    .select({
      routeId: routes.routeId,
      routeName: routes.routeName,
      routeAuthor: routes.routeAuthor,
      routeLocation: routes.routeLocation,
      routeDescription: routes.routeDescription,
      routeImage: routes.routeImageUrl,
      routeCompletionTime: routes.routeCompletionTime,
      routeDistance: routes.routeDistance,
      routeFavourites: routes.routeFavouriteCount,
      routeViews: routes.routeViews
    })
    .from(routes)
    .where(eq(routes.isPublic, true));

  return communityRoutes.map(route => ({
    ...route,
    routeLocation: route.routeLocation as RouteLocation,
  }));
};

export const getFeaturedRoutes = async (): Promise<Array<FeaturedRoute>> => {
  const featuredRoute = await db
    .select({
      routeId: routes.routeId,
      routeName: routes.routeName,
      routeAuthor: routes.routeAuthor,
      routeLocation: routes.routeLocation,
      routeDescription: routes.routeDescription,
      routeImage: routes.routeImageUrl,
      routeCompletionTime: routes.routeCompletionTime,
      routeDistance: routes.routeDistance,
      routeFavourites: routes.routeFavouriteCount,
      routeViews: routes.routeViews
    })
    .from(routes)
    .where(
      and(
        eq(routes.isFeatured, true),
        eq(routes.isPublic, true)
      )
    ).limit(8);

  return featuredRoute.map(route => ({
    ...route,
    routeLocation: route.routeLocation as RouteLocation,
  }));
};


export const getUserRouteFromId = async (clientRouteId: string) => {
  const userId = await getUserId();

  if (!userId) {
    return {
      title: "Unable to authenticate user.",
      description: "Please logout and then back in.",
      variant: ToastVariant.Destructive,
    };
  }

  const userRoute = await db
    .select({
      routeId: routes.routeId,
      routeName: routes.routeName,
      routeDescription: routes.routeDescription,
      routeState: routes.routeState,
    })
    .from(routes)
    .where(
      and(
        eq(routes.routeId, clientRouteId),
        eq(routes.routeCreator, userId),
      ),
    )
    .limit(1);

  return {
    title: "Error",
    description: "Unable to authenticate user. Please logout and then back in.",
    variant: ToastVariant.Destructive,
    userRoute,
  };
};

export const getPublicUserRouteFromId = async (clientRouteId: string) => {
  const publicUserRoute = await db
    .select({
      routeId: routes.routeId,
      routeName: routes.routeName,
      routeDescription: routes.routeDescription,
      routeState: routes.routeState,
    })
    .from(routes)
    .where(
      and(
        eq(routes.routeId, clientRouteId),
        eq(routes.isPublic, true),
      ),
    )
    .limit(1);

  return {
    publicUserRoute,
  };
};

export const getPublicRouteId = async (clientRouteId: string): Promise<string> => {
  const publicRouteId = await db
    .select({
      routeId: routes.routeId,
    })
    .from(routes)
    .where(
      and(
        eq(routes.routeId, clientRouteId),
        eq(routes.isPublic, true),
      ),
    )
    .limit(1);

  return publicRouteId[0].routeId
};

export const incrementPublicRouteView = async (clientRouteId: string) => {
  await db
    .update(routes)
    .set({
      routeViews: increment(routes.routeViews)
    })
    .where(
      eq(routes.routeId, clientRouteId),
    );
}

export const favouriteRoute = async (clientRouteId: string) => {
  const userId = await getUserId();
  if (!userId) {
    throw new Error("Cannot get userId inside favouriteRoute.");
  }

  const publicRouteId: string = await getPublicRouteId(clientRouteId);

  const existingFavourite = await db
    .select()
    .from(favourites)
    .where(
      and(
        eq(favourites.routeId, publicRouteId),
        eq(favourites.userId, userId),
      ),
    )
    .limit(1);

  if (existingFavourite.length < 1) {
    await db.transaction(async (tx) => {
      await tx.insert(favourites).values({
        routeId: publicRouteId,
        userId: userId,
      });

      await tx
        .update(routes)
        .set({
          routeFavouriteCount: sql`${routes.routeFavouriteCount} + 1`,
        })
        .where(eq(routes.routeId, publicRouteId));
    });
  } else {
    await db.transaction(async (tx) => {
      await tx
        .delete(favourites)
        .where(
          and(
            eq(favourites.routeId, publicRouteId),
            eq(favourites.userId, userId),
          )
        );

      await tx
        .update(routes)
        .set({
          routeFavouriteCount: sql`GREATEST(${routes.routeFavouriteCount} - 1, 0)`,
        })
        .where(eq(routes.routeId, publicRouteId));
    });
  }
};

export const incrementPublicRouteFavouriteCount = async (clientRouteId: string) => {
  await db
    .update(routes)
    .set({
      routeFavouriteCount: sql`${routes.routeFavouriteCount} + 1`
    })
    .where(eq(routes.routeId, clientRouteId));
};

export const decrementPublicRouteFavouriteCount = async (clientRouteId: string) => {
  await db
    .update(routes)
    .set({
      routeFavouriteCount: sql`GREATEST(${routes.routeFavouriteCount} - 1, 0)`
    })
    .where(eq(routes.routeId, clientRouteId));
};

export const saveRoute = async (
  route: RouteData,
  clientRouteId: string | undefined,
) => {
  const userId = await getUserId();
  const username = await getUsername();

  if (!userId) {
    return {
      title: "Error",
      description:
        "Unable to authenticate user. Please logout and then back in.",
      variant: ToastVariant.Destructive,
    };
  }

  if (!username) {
    return {
      title: "Error",
      description: "Unable to get username.",
      variant: ToastVariant.Destructive,
    };
  }

  if (route.routeJson.length <= 1) {
    return {
      title: "Warning",
      description:
        "A route must have at least a start and destination before you are able to save it.",
      variant: ToastVariant.Warning,
    };
  }

  const startLongitude = route.routeJson[0].longitude
  const startLatitude = route.routeJson[0].latitude

  const endLongitude = route.routeJson[route.routeJson.length - 1].longitude
  const endLatitude = route.routeJson[route.routeJson.length - 1].latitude
  const routeLocation = await getRegionFromCoordinates({ routeStartPlace: [startLongitude, startLatitude], routeDestinationPlace: [endLongitude, endLatitude] })

  const serverSideRoute = (await getDirections({ coordinates: route.routeJson, routeType: RouteType.MarkerProps }))
  const routeDistance = serverSideRoute.routes[0].distance
  const routeCompletionTime = serverSideRoute.routes[0].duration

  if (clientRouteId !== undefined && await isForkedRoute(clientRouteId, userId) === true) {
    clientRouteId = undefined
  }

  if (clientRouteId !== undefined) {
    try {
      const [{ routeId, routeState }] = await db
        .select({
          routeId: routes.routeId,
          routeState: routes.routeState
        })
        .from(routes)
        .where(
          and(
            eq(routes.routeId, clientRouteId),
            eq(routes.routeCreator, userId),
          ),
        )
        .limit(1);

      const routeStateRecord = routeState as unknown as MarkerProps[]
      let thumbnailUploadResponse = null

      const routesAreEqual = areBothRoutesEqual(routeStateRecord, route.routeJson)

      if (!routesAreEqual) {
        thumbnailUploadResponse = await UploadRouteThumbnail(route)
        if (thumbnailUploadResponse.uploadSuccess === null) {
          return {
            title: "Error",
            description:
              "Unable to upload the thumbnail. Your route has still been saved.",
            variant: ToastVariant.Destructive,
          };
        }

        const previousRouteThumbnail = await db
          .select({
            fileKey: routes.routeImageFileKey,
            fileUrl: routes.routeImageUrl
          })
          .from(routes)
          .where(
            and(
              eq(routes.routeCreator, userId),
              eq(routes.routeId, routeId),
            )
          )
          .limit(1);

        await utapi.deleteFiles(previousRouteThumbnail[0].fileKey);
      }

      if (routesAreEqual) {
        await db
          .update(routes)
          .set({
            routeName: route.routeName,
            routeLocation: {
              routeStartPlace: routeLocation[0],
              routeDestinationPlace: routeLocation[1],
            },
            routeDescription: route.routeDescription,
            routeState: route.routeJson,
            routeCompletionTime: routeCompletionTime,
            routeDistance: routeDistance,
          })
          .where(
            and(
              eq(routes.routeId, routeId),
              eq(routes.routeCreator, userId),
            ),
          );
      } else {
        await db
          .update(routes)
          .set({
            routeName: route.routeName,
            routeLocation: {
              routeStartPlace: routeLocation[0],
              routeDestinationPlace: routeLocation[1],
            },
            routeDescription: route.routeDescription,
            routeState: route.routeJson,
            routeImageUrl: thumbnailUploadResponse?.fileUrl ?? "",
            routeImageFileKey: thumbnailUploadResponse?.fileKey ?? "",
            routeCompletionTime: routeCompletionTime,
            routeDistance: routeDistance,
          })
          .where(
            and(
              eq(routes.routeId, routeId),
              eq(routes.routeCreator, userId),
            ),
          );
      }

      return {
        title: "Route Updated",
        description: "Your route has been updated and saved.",
        variant: ToastVariant.Success,
        routeId: routeId,
      };
    } catch {
      return {
        title: "Error",
        description: "Something went wrong.",
        variant: ToastVariant.Destructive,
      };
    }
  } else {
    const thumbnailUploadResponse = await UploadRouteThumbnail(route)

    if (thumbnailUploadResponse.uploadSuccess === null) {
      return {
        title: "Error",
        description:
          "Unable to upload the thumbnail. Your route has still been saved.",
        variant: ToastVariant.Destructive,
      };
    }

    const [routeId] = await db
      .insert(routes)
      .values({
        routeName: route.routeName,
        routeAuthor: username,
        routeLocation: {
          routeStartPlace: routeLocation[0],
          routeDestinationPlace: routeLocation[1],
        },
        routeDescription: route.routeDescription,
        routeState: route.routeJson,
        routeCreator: userId,
        routeImageUrl: thumbnailUploadResponse.fileUrl ? thumbnailUploadResponse.fileUrl : "",
        routeImageFileKey: thumbnailUploadResponse.fileKey ? thumbnailUploadResponse.fileKey : "",
        routeCompletionTime: routeCompletionTime,
        routeDistance: routeDistance,
      })
      .returning({ routeId: routes.routeId });

    return {
      title: "New Route Saved",
      description: "Your route has been saved sucessfully.",
      variant: ToastVariant.Success,
      routeId: routeId.routeId,
    };
  }
};

export const deleteRoute = async (routeId: string) => {
  const userId = await getUserId();

  if (userId) {
    const routeThumbnail = await db
      .select({
        fileKey: routes.routeImageFileKey,
      })
      .from(routes)
      .where(
        and(
          eq(routes.routeCreator, userId),
          eq(routes.routeId, routeId)
        ))
      .limit(1);

    await utapi.deleteFiles(routeThumbnail[0].fileKey);
    await db.delete(routes).where(
      and(eq(routes.routeId, routeId), eq(routes.routeCreator, userId)),
    );
  }
};

export const updateRoutePrivacy = async (
  routeId: string,
  isPublic: boolean,
) => {
  const userId = await getUserId();

  if (!userId) {
    throw new Error("Cannot get userId.");
  }

  await db.update(routes).set({
    isPublic: isPublic,
  })
    .where(
      and(eq(routes.routeCreator, userId), eq(routes.routeId, routeId)),
    );
};

function areBothRoutesEqual(routeStateRecord: MarkerProps[], routeJson: MarkerProps[]): boolean {
  if (routeStateRecord.length !== routeJson.length) {
    return false
  }

  for (let i = 0; i < routeStateRecord.length; i++) {
    const routeStateWaypoint = routeStateRecord[i];
    const routeWaypoint = routeJson[i];

    if (
      routeStateWaypoint.latitude !== routeWaypoint.latitude ||
      routeStateWaypoint.longitude !== routeWaypoint.longitude
    ) {
      return false
    }
  }
  return true
}

async function isForkedRoute(clientRouteId: string, userId: string): Promise<boolean> {
  const [{ routeCreator }] = await db
    .select({
      routeCreator: routes.routeCreator
    })
    .from(routes)
    .where(
      and(
        eq(routes.routeId, clientRouteId),
      ),
    )
    .limit(1);

  if (userId === routeCreator) {
    return false
  } else {
    return true
  }
}

const increment = (column: AnyColumn, value = 1) => {
  return sql`${column} + ${value}`;
};
