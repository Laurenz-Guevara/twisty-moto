import { relations, sql } from "drizzle-orm";
import {
  boolean,
  pgTableCreator,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
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

export const avatars = createTable("avatar", {
  userId: uuid("user_id")
    .notNull()
    .primaryKey()
    .references(() => users.userId),
  avatarUrl: varchar("avatar_url", { length: 255 }).notNull().default(""),
  avatarFileKey: varchar("avatar_file_key", { length: 255 }).notNull().default(
    "",
  ),
});

export const notifications = createTable("notification", {
  notificationId: uuid("notification_id")
    .default(sql`gen_random_uuid()`)
    .notNull()
    .primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),

  description: varchar("description", { length: 1000 }).default(""),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  isRead: boolean("is_read").default(false).notNull(),

  category: varchar("category", { length: 32 }).notNull(),

  priority: varchar("priority", { length: 32 }).notNull(),

  actionLabel: varchar("action_label", { length: 128 }),
  actionUrl: varchar("action_url", { length: 256 }),
});

export const userRelations = relations(users, ({ one, many }) => ({
  avatar: one(avatars, {
    fields: [users.userId],
    references: [avatars.userId],
  }),
  notifications: many(notifications),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.userId],
  }),
}));
