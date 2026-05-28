import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";

export const packagesTable = pgTable("packages", {
  id: text("id").primaryKey(),
  operator: text("operator").notNull(),
  name: text("name").notNull(),
  dataLabel: text("data_label").notNull(),
  priceFcfa: integer("price_fcfa").notNull(),
  validity: text("validity").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export type Package = typeof packagesTable.$inferSelect;
export type InsertPackage = typeof packagesTable.$inferInsert;
