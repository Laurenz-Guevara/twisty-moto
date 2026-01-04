"use server"

import { db } from "@/db";
import { avatars, routes, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NeonDbError } from "@neondatabase/serverless";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ToastVariant } from "@/enums/enums";
import { getUserId } from "@/db/auth/session";
import { User } from "@/types/types";

const { getAccessToken } = getKindeServerSession();

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

export const updateProfileInfo = async (values: Partial<User>) => {
  if (
    values.username === null || values.username === undefined ||
    values.username.length < 1
  ) {
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
  const userId = await getUserId();

  if (!accessToken?.sub || userId == null) {
    return {
      title: "Error",
      description: "Unable to authenticate user. Please log in again.",
      variant: ToastVariant.Destructive,
    };
  }

  await db.transaction(async (tx) => {
    try {
      await tx
        .update(users)
        .set({
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
        })
        .where(eq(users.kindeId, accessToken.sub));

      await tx.update(routes).set({ routeAuthor: values.username }).where(
        eq(routes.routeCreator, userId),
      );
    } catch (error) {
      tx.rollback();
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
  });

  return {
    title: "Success",
    description: "Your profile has been updated sucessfully.",
    variant: ToastVariant.Success,
  };
};

