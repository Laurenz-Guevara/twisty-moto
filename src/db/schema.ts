import { relations, sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
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

  title: varchar("title", { length: 255 }).notNull().default(""),

  description: varchar("description", { length: 1000 }).notNull().default(""),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  isRead: boolean("is_read").default(false).notNull(),

  category: varchar("category", { length: 32 }).notNull().default(""),

  priority: varchar("priority", { length: 32 }).notNull().default("low"),

  actionLabel: varchar("action_label", { length: 128 }).notNull().default(""),
  actionUrl: varchar("action_url", { length: 256 }).notNull().default(""),
});

export const userRelations = relations(users, ({ one, many }) => ({
  avatar: one(avatars, {
    fields: [users.userId],
    references: [avatars.userId],
  }),
  notifications: many(notifications),
  rotues: many(routes),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.userId],
  }),
}));

export const routes = createTable("routes", {
  routeId: uuid("route_id")
    .default(sql`gen_random_uuid()`)
    .notNull()
    .primaryKey(),

  routeCreator: uuid("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),

  routeName: varchar("route_name", { length: 128 }).notNull().default(""),

  routeLocation: varchar("route_location", { length: 128 }).notNull().default(
    "",
  ),

  routeDescription: varchar("route_description", { length: 1000 }).notNull()
    .default(""),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  isPublic: boolean("is_public").default(false).notNull(),

  routeState: jsonb("route_state").notNull().default({}),
});

export const routesRelations = relations(routes, ({ one }) => ({
  user: one(users, {
    fields: [routes.routeCreator],
    references: [users.userId],
  }),
}));
