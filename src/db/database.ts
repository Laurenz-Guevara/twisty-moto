"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ToastVariant } from "./enums";
import { NeonDbError } from "@neondatabase/serverless";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const { getAccessToken } = getKindeServerSession();

export const getUsername = async () => {
  const accessToken = await getAccessToken();

  if (accessToken) {
    const user = await db
      .select({
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.kindeId, accessToken.sub))
      .limit(1);

    return user[0] || null;
  }
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

export const updateAvatarUrl = async (uploaderId: string, imageUrl: string) => {
  const accessToken = await getAccessToken();

  if (!accessToken?.sub && accessToken?.sub !== uploaderId) {
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
        avatarUrl: imageUrl,
      })
      .where(eq(users.kindeId, accessToken.sub));
    return {
      title: "Sucess",
      description: "Your avatar has been updated.",
      variant: ToastVariant.Success,
    };
  } catch {
    return {
      title: "Error",
      description: "An unexpected error has occured",
      variant: ToastVariant.Destructive,
    };
  }
};
