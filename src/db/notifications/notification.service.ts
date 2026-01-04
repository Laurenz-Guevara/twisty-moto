"use server"

import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getUserId } from "@/db/auth/session";

const { getAccessToken } = getKindeServerSession();

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
