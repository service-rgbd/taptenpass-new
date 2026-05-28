import { boolean, integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const accountsTable = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  balanceFcfa: integer("balance_fcfa").notNull().default(0),
  lockedBalanceFcfa: integer("locked_balance_fcfa").notNull().default(0),
  totalRechargedFcfa: integer("total_recharged_fcfa").notNull().default(0),
  activeLoanGb: integer("active_loan_gb").notNull().default(0),
  loanRepaidPending: boolean("loan_repaid_pending").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Account = typeof accountsTable.$inferSelect;
export type InsertAccount = typeof accountsTable.$inferInsert;
