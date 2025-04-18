"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ToastVariant } from "./enums";
import { NeonDbError } from "@neondatabase/serverless";

export const getUsername = async (kindeId: string) => {
  const user = await db
    .select({
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.kindeId, kindeId))
    .limit(1);

  return user[0] || null;
};

export const checkUsernameExists = async (username: string) => {
  const user = await db
    .select({ username: users.username })
    .from(users)
    .where(sql`LOWER(${users.username}) = LOWER(${username})`)
    .limit(1);

  if (user[0]?.username.toLowerCase() === username.toLowerCase()) return true;
  return false;
};

export const updateProfileInfo = async (
  kindeId: string,
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

  try {
    await db
      .update(users)
      .set({
        username: values.username,
        firstName: values.firstName,
        lastName: values.lastName,
      })
      .where(eq(users.kindeId, kindeId));

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

export const updateAvatarUrl = async (kindeId: string, imageUrl: string) => {
  try {
    await db
      .update(users)
      .set({
        avatarUrl: imageUrl,
      })
      .where(eq(users.kindeId, kindeId));
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
