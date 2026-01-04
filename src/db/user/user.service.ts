"use server"

import { db } from "@/db";
import { avatars, notifications, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { utapi } from "@/app/api/uploadthing/core";
import { deleteKindeUser } from "@/lib/kinde-service";
import { getAvatarFileKey } from "@/db/avatars/avatar.service";
import { getRouteFileKeys } from "@/db/routes/routes.service";
import { ToastVariant } from "@/enums/enums";

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

      const avatarFileKey = await getAvatarFileKey(userId);
      const routeFileKeys = await getRouteFileKeys(userId);

      if (avatarFileKey !== undefined && routeFileKeys !== undefined) {
        await utapi.deleteFiles([avatarFileKey, ...routeFileKeys]);
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
        deleteKindeUser(accessToken)
      } catch {
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
  return {
    title: "Success",
    description: "Your account has been sucessfully deleted.",
    variant: ToastVariant.Success,
  };
};

