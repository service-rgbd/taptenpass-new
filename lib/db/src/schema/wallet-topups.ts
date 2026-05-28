import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const walletTopupStatusEnum = [
  "pending",
  "success",
  "failed",
] as const;

export type WalletTopupStatus = (typeof walletTopupStatusEnum)[number];

export const walletTopupsTable = pgTable("wallet_topups", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  amountFcfa: integer("amount_fcfa").notNull(),
  feeFcfa: integer("fee_fcfa").notNull(),
  totalPaidFcfa: integer("total_paid_fcfa").notNull(),
  status: text("status").notNull().$type<WalletTopupStatus>(),
  reference: text("reference").notNull().unique(),
  paystackReference: text("paystack_reference"),
  paymentMethod: text("payment_method").notNull().default("paystack"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WalletTopup = typeof walletTopupsTable.$inferSelect;
export type InsertWalletTopup = typeof walletTopupsTable.$inferInsert;
