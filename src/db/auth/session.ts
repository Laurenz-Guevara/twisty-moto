"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const { getAccessToken } = getKindeServerSession();

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

export const getUsername = async () => {
  const accessToken = await getAccessToken();

  if (accessToken) {
    const userId = await db
      .select({
        username: users.username,
      })
      .from(users)
      .where(eq(users.kindeId, accessToken.sub))
      .limit(1);

    return userId[0].username || null;
  }
};

