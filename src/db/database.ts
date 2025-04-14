"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const getUsername = async (kindeId: string) => {
  const user = await db
    .select({ username: users.username })
    .from(users)
    .where(
      and(
        eq(users.kindeId, kindeId),
      ),
    );

  return user || null;
};
