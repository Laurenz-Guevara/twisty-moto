"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUsername = async (kindeId: string) => {
  const user = await db
    .select({
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(users)
    .where(eq(users.kindeId, kindeId))
    .limit(1);

  return user[0] || null;
};

export const updateProfileInfo = async (
  kindeId: string,
  values: { username?: string; firstName?: string; lastName?: string },
) => {
  await db
    .update(users)
    .set({
      username: values.username,
      firstName: values.firstName,
      lastName: values.lastName,
    })
    .where(eq(users.kindeId, kindeId));
};
