import { sql } from "drizzle-orm";
import { pgTableCreator, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const createTable = pgTableCreator((name) => `tm_${name}`);

export const users = createTable("user", {
  userId: uuid("user_id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),

  createdAt: timestamp("created_at").defaultNow(),

  kindeId: varchar("kinde_id", { length: 256 })
    .notNull()
    .unique(),

  email: varchar("email", { length: 255 })
    .notNull()
    .unique(),

  username: varchar("username", { length: 255 })
    .unique()
    .notNull()
    .default(`User_${nanoid()}`),

  firstName: varchar("first_name", { length: 255 })
    .notNull()
    .default(""),

  lastName: varchar("last_name", { length: 255 })
    .notNull()
    .default(""),
});
