"use server";

import { db } from "@/db";
import { avatars, notifications, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ToastVariant } from "./enums";
import { NeonDbError } from "@neondatabase/serverless";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const { getAccessToken } = getKindeServerSession();

export const setupNewUser = async (kindeId: string, email: string) => {
  const uuid = sql`gen_random_uuid()`;

  await db
    .insert(users)
    .values({
      userId: uuid,
      kindeId: kindeId,
      email: email,
    });

  await db
    .insert(notifications)
    .values({
      userId: uuid,
      title: "Please set up your username",
      description:
        "Complete your profile by setting up a username for your account.",
      category: "account",
      priority: "high",
    });
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
