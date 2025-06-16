"use server";

import { db } from "@/db";
import { avatars, notifications, routes, users } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { ToastVariant } from "./enums";
import { NeonDbError } from "@neondatabase/serverless";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { utapi } from "@/app/api/uploadthing/core";
import { RouteData } from "@/app/stores/useRouteStore";
import { Route } from "@/db/types";

const { getAccessToken } = getKindeServerSession();

export const setupNewUser = async (kindeId: string, email: string) => {
  const [user] = await db
    .insert(users)
    .values({
      userId: sql`gen_random_uuid()`,
      kindeId: kindeId,
      email: email,
    })
    .returning({ userId: users.userId });

  await db
    .insert(notifications)
    .values([{
      userId: user.userId,
      title: "Please set up your username",
      description:
        "Complete your profile by setting up a username for your account.",
      category: "account",
      priority: "high",
    }, {
      userId: user.userId,
      title: "Welcome to the platform!",
      description:
        "Thank you for joining. Explore our features to get started.",
      category: "misc",
      priority: "none",
    }]);
};

export const getUserId = async () => {
  const accessToken = await getAccessToken();

  if (accessToken) {
    const userId = await db
      .select({
        userId: users.userId,
      })
      .from(users)
      .where(eq(users.kindeId, accessToken.sub))
      .limit(1);

    return userId[0].userId || null;
  }
};

export const getPrivateUserProfile = async () => {
  const accessToken = await getAccessToken();

  if (accessToken) {
    const user = await db
      .select({
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        avatarUrl: avatars.avatarUrl,
      })
      .from(users)
      .leftJoin(avatars, eq(users.userId, avatars.userId))
      .where(eq(users.kindeId, accessToken.sub))
      .limit(1);

    return user[0] || null;
  }
};

export const getPrivateUserNames = async () => {
  const accessToken = await getAccessToken();

  if (accessToken) {
    const user = await db
      .select({
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.kindeId, accessToken.sub))
      .limit(1);

    return user[0] || null;
  }
};

export const getPublicUserProfile = async (username: string) => {
  const user = await db
    .select({
      username: users.username,
      avatarUrl: avatars.avatarUrl,
    })
    .from(users)
    .leftJoin(avatars, eq(users.userId, avatars.userId))
    .where(eq(users.username, username))
    .limit(1);

  return user[0] || null;
};

export const checkUsernameExists = async (username: string) => {
  const accessToken = await getAccessToken();

  const user = await db
    .select({ username: users.username, kindeId: users.kindeId })
    .from(users)
    .where(sql`LOWER(${users.username}) = LOWER(${username})`)
    .limit(1);

  const usernameAlreadyExists =
    user[0]?.username.toLowerCase() === username.toLowerCase();
  const usernameOwnedBySameUser = user[0]?.kindeId === accessToken?.sub;

  if (usernameAlreadyExists && !usernameOwnedBySameUser) return true;
  return false;
};

export const updateProfileInfo = async (
  values: {
    username: string;
    firstName?: string;
    lastName?: string;
  },
) => {
  if (values.username === null || values.username.length < 1) {
    return {
      title: "Error",
      description: "You cannot have an empty username.",
      variant: ToastVariant.Destructive,
    };
  }

  if (values.username.toLowerCase().includes("admin")) {
    return {
      title: "Error",
      description: "You cannot have 'Admin' in your username.",
      variant: ToastVariant.Destructive,
    };
  }

  const accessToken = await getAccessToken();

  if (!accessToken?.sub) {
    return {
      title: "Error",
      description: "Unable to authenticate user. Please log in again.",
      variant: ToastVariant.Destructive,
    };
  }

  try {
    await db
      .update(users)
      .set({
        username: values.username,
        firstName: values.firstName,
        lastName: values.lastName,
      })
      .where(eq(users.kindeId, accessToken.sub));

    return {
      title: "Success",
      description: "Your profile has been updated sucessfully.",
      variant: ToastVariant.Success,
    };
  } catch (error) {
    if (error instanceof NeonDbError) {
      if (error.constraint === "tm_user_username_unique") {
        return {
          title: "Error",
          description: "This username already exists.",
          variant: ToastVariant.Destructive,
        };
      }
    }

    return {
      title: "Error",
      description: "An unexpected error has occured",
      variant: ToastVariant.Destructive,
    };
  }
};

export const getAvatarFileKey = async () => {
  const userId = await getUserId();

  if (userId === null || userId === undefined) {
    throw new Error("Cannot get userId.");
  }

  const avatar = await db
    .select({ avatarFileKey: avatars.avatarFileKey })
    .from(avatars)
    .where(eq(avatars.userId, userId))
    .limit(1);

  if (avatar[0]?.avatarFileKey.length > 0) {
    return avatar[0].avatarFileKey;
  } else {
    return undefined;
  }
};

export const updateAvatarUrl = async (
  uuid: string,
  imgUrl: string,
  fileKey: string,
) => {
  if (!uuid) {
    return {
      title: "Error",
      description: "Unable to find user. Please try again later.",
      variant: ToastVariant.Destructive,
    };
  }

  try {
    const existing = await db
      .select({
        avatarFileKey: avatars.avatarFileKey,
      })
      .from(avatars)
      .where(eq(avatars.userId, uuid))
      .limit(1);

    let existingFileKey: string | null = null;

    if (existing.length > 0) {
      existingFileKey = existing[0].avatarFileKey;
    }

    await db
      .insert(avatars)
      .values({
        userId: uuid,
        avatarUrl: imgUrl,
        avatarFileKey: fileKey,
      })
      .onConflictDoUpdate(
        {
          target: avatars.userId,
          set: {
            avatarUrl: imgUrl,
            avatarFileKey: fileKey,
          },
        },
      );

    return {
      title: "Sucess",
      description: "Your avatar has been updated.",
      variant: ToastVariant.Success,
      fileKey: existingFileKey ? existingFileKey : undefined,
    };
  } catch {
    return {
      title: "Error",
      description: "An unexpected error has occured",
      variant: ToastVariant.Destructive,
    };
  }
};

async function getTokenFromKinde() {
  const response = await fetch(
    "https://twistymoto.kinde.com/oauth2/token",
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        audience: process.env.KINDE_M2M_AUDIENCE!,
        grant_type: "client_credentials",
        client_id: process.env.KINDE_M2M_CLIENT_ID!,
        client_secret: process.env.KINDE_M2M_CLIENT_SECRET!,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  return response.json();
}

export const deleteAccount = async (
  kindeId: string,
  email: string,
): Promise<{ title: string; description: string; variant: string }> => {
  const accessToken = await getAccessToken();

  if (
    !accessToken?.sub && accessToken?.sub !== kindeId &&
    accessToken?.email !== email
  ) {
    return {
      title: "Error",
      description: "Unable to authenticate user. Please try again later.",
      variant: ToastVariant.Destructive,
    };
  }

  try {
    await db.transaction(async (tx) => {
      const [{ userId }] = await tx
        .select({
          userId: users.userId,
        })
        .from(users)
        .where(eq(users.kindeId, accessToken.sub))
        .limit(1);

      const avatarFileKey = await getAvatarFileKey();

      if (avatarFileKey !== undefined) {
        await utapi.deleteFiles(avatarFileKey);
        await tx.delete(avatars)
          .where(
            eq(avatars.userId, userId),
          );
      }

      await tx.delete(notifications)
        .where(
          eq(notifications.userId, userId),
        );

      await tx.delete(users).where(eq(users.kindeId, accessToken.sub));

      try {
        const token = await getTokenFromKinde();

        await fetch(
          `https://twistymoto.kinde.com/api/v1/users/${accessToken.sub}/sessions`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token.access_token}`,
            },
          },
        );

        await fetch(
          `https://twistymoto.kinde.com/api/v1/user?id=${accessToken.sub}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token.access_token}`,
            },
          },
        );
        console.log("AFTER FETCH SUCESSS");
      } catch (error: unknown) {
        console.log(
          "Failed during delete action. Rolling back query...",
          error,
        );
        tx.rollback();

        return {
          title: "Error",
          description:
            "An error has occured. Please try again later. No changes have been made.",
          variant: ToastVariant.Destructive,
        };
      }
    });
  } catch {
    return {
      title: "Error",
      description:
        "An error has occured. Please try again later. No changes have been made.",
      variant: ToastVariant.Destructive,
    };
  }
  console.log("SUCESSS");
  return {
    title: "Success",
    description: "Your account has been sucessfully deleted.",
    variant: ToastVariant.Success,
  };
};

export const getUserNotifications = async () => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return [];
  }

  const [{ userId }] = await db
    .select({
      userId: users.userId,
    })
    .from(users)
    .where(eq(users.kindeId, accessToken.sub))
    .limit(1);

  const userNotifications = await db
    .select({
      id: notifications.notificationId,
      title: notifications.title,
      description: notifications.description,
      time: notifications.createdAt,
      read: notifications.isRead,
      category: notifications.category,
      priority: notifications.priority,
      actionLabel: notifications.actionLabel,
      actionUrl: notifications.actionUrl,
    }).from(notifications)
    .where(eq(notifications.userId, userId));

  return userNotifications || [];
};

export const updateUserNotification = async (
  updateType: string,
  nid: string,
) => {
  const userId = await getUserId();

  if (userId === null || userId === undefined) {
    throw new Error("Cannot get userId.");
  }

  switch (updateType) {
    case "readall":
      await db
        .update(notifications)
        .set({
          isRead: true,
        })
        .where(
          and(
            eq(notifications.isRead, false),
            eq(notifications.userId, userId),
          ),
        );
      break;
    case "read":
      await db
        .update(notifications)
        .set({
          isRead: true,
        })
        .where(
          and(
            eq(notifications.notificationId, nid),
            eq(notifications.userId, userId),
          ),
        );

      break;
    case "unread":
      await db
        .update(notifications)
        .set({
          isRead: false,
        })
        .where(
          and(
            eq(notifications.notificationId, nid),
            eq(notifications.userId, userId),
          ),
        );
      break;
    case "delete":
      await db
        .delete(notifications)
        .where(
          and(
            eq(notifications.notificationId, nid),
            eq(notifications.userId, userId),
          ),
        );
      break;
  }
};

export const getUserRoutes = async (): Promise<Array<Route>> => {
  const userId = await getUserId();

  if (!userId) throw new Error("No userid");

  const userRoutes = await db
    .select({
      routeId: routes.routeId,
      routeName: routes.routeName,
      routeLocation: routes.routeLocation,
      routeDescription: routes.routeDescription,
      routeImage: routes.routeImageUrl,
    })
    .from(routes)
    .where(eq(routes.routeCreator, userId));

  return userRoutes;
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

export const saveRoute = async (
  route: RouteData,
  clientRouteId: string | undefined,
) => {
  const userId = await getUserId();

  if (!userId) {
    return {
      title: "Error",
      description:
        "Unable to authenticate user. Please logout and then back in.",
      variant: ToastVariant.Destructive,
    };
  }

  if (clientRouteId !== undefined) {
    try {
      const [{ routeId }] = await db
        .select({
          routeId: routes.routeId,
        })
        .from(routes)
        .where(
          and(
            eq(routes.routeId, clientRouteId),
            eq(routes.routeCreator, userId),
          ),
        )
        .limit(1);

      await db
        .update(routes)
        .set({
          routeName: route.routeName,
          routeDescription: route.routeDescription,
          routeState: route.routeJson,
        })
        .where(
          and(
            eq(routes.routeId, routeId),
            eq(routes.routeCreator, userId),
          ),
        );

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
    const [routeId] = await db
      .insert(routes)
      .values({
        routeName: route.routeName,
        routeDescription: route.routeDescription,
        routeState: route.routeJson,
        routeCreator: userId,
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
    await db.delete(routes).where(
      and(eq(routes.routeId, routeId), eq(routes.routeCreator, userId)),
    );
  }
};
