import { pgTableCreator, serial, varchar } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `tm_${name}`);

export const restaurants = createTable("routes", {
  id: serial("id").primaryKey(),
  routeName: varchar("routeName", { length: 256 }).notNull(),
});
