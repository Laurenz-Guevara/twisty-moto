"use server"

import { db } from "@/db";
import { avatars } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ToastVariant } from "@/db/enums";

export const getAvatarFileKey = async (userId: string) => {
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

