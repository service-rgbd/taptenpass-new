import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { packagesTable } from "./packages";
import { usersTable } from "./users";

export const transactionStatusEnum = [
  "pending",
  "processing",
  "success",
  "failed",
  "refunded",
] as const;

export type TransactionStatus = (typeof transactionStatusEnum)[number];

export const transactionsTable = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  packageId: text("package_id")
    .notNull()
    .references(() => packagesTable.id),
  beneficiaryPhone: text("beneficiary_phone").notNull(),
  amountFcfa: integer("amount_fcfa").notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().$type<TransactionStatus>(),
  reference: text("reference").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Transaction = typeof transactionsTable.$inferSelect;
export type InsertTransaction = typeof transactionsTable.$inferInsert;
