import { db } from "@workspace/db";
import {
  accountsTable,
  packagesTable,
  transactionsTable,
  usersTable,
} from "@workspace/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { env } from "../lib/env";
import { AppError } from "../lib/errors";
import { signAccessToken } from "../lib/jwt";
import { hashPassword, verifyPassword } from "../lib/password";
import { isValidIvorianPhone, normalizePhone } from "../lib/phone";

function toUserResponse(user: typeof usersTable.$inferSelect, balanceFcfa: number) {
  return {
    id: user.id,
    fullname: user.fullname,
    phone: user.phone,
    email: user.email,
    walletBalance: balanceFcfa,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function registerUser(input: {
  fullname: string;
  phone: string;
  email?: string;
  password: string;
}) {
  const phone = normalizePhone(input.phone);

  if (!isValidIvorianPhone(phone)) {
    throw new AppError(400, "Numéro de téléphone ivoirien invalide.");
  }

  if (input.password.length < 6) {
    throw new AppError(400, "Le mot de passe doit contenir au moins 6 caractères.");
  }

  const existing = await db.query.usersTable.findFirst({
    where: eq(usersTable.phone, phone),
  });

  if (existing) {
    throw new AppError(409, "Ce numéro de téléphone est déjà enregistré.");
  }

  const passwordHash = await hashPassword(input.password);

  const [user] = await db
    .insert(usersTable)
    .values({
      fullname: input.fullname.trim(),
      phone,
      email: input.email?.trim() ?? "",
      passwordHash,
    })
    .returning();

  const [account] = await db
    .insert(accountsTable)
    .values({
      userId: user.id,
      balanceFcfa: env.initialWalletBalance,
    })
    .returning();

  const token = signAccessToken({ sub: user.id, phone: user.phone });

  return {
    token,
    user: toUserResponse(user, account.balanceFcfa),
  };
}

export async function loginUser(input: { phone: string; password: string }) {
  const phone = normalizePhone(input.phone);

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.phone, phone),
  });

  if (!user || !user.isActive) {
    throw new AppError(401, "Identifiants invalides.");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "Identifiants invalides.");
  }

  const account = await db.query.accountsTable.findFirst({
    where: eq(accountsTable.userId, user.id),
  });

  if (!account) {
    throw new AppError(500, "Compte portefeuille introuvable.");
  }

  const token = signAccessToken({ sub: user.id, phone: user.phone });

  return {
    token,
    user: toUserResponse(user, account.balanceFcfa),
  };
}

export async function getCurrentUser(userId: string) {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });

  if (!user || !user.isActive) {
    throw new AppError(404, "Utilisateur introuvable.");
  }

  const account = await db.query.accountsTable.findFirst({
    where: eq(accountsTable.userId, user.id),
  });

  if (!account) {
    throw new AppError(500, "Compte portefeuille introuvable.");
  }

  return toUserResponse(user, account.balanceFcfa);
}

export async function getWallet(userId: string) {
  const account = await db.query.accountsTable.findFirst({
    where: eq(accountsTable.userId, userId),
  });

  if (!account) {
    throw new AppError(404, "Compte portefeuille introuvable.");
  }

  return {
    balanceFcfa: account.balanceFcfa,
    lockedBalanceFcfa: account.lockedBalanceFcfa,
    availableBalanceFcfa: account.balanceFcfa - account.lockedBalanceFcfa,
  };
}

function buildReference(): string {
  return `TTP${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const ALLOWED_PAYMENT_METHODS = new Set([
  "wave",
  "orange_money",
  "mtn_money",
  "card",
]);

export async function createTransaction(
  userId: string,
  input: {
    packageId: string;
    beneficiaryPhone: string;
    paymentMethod: string;
  },
) {
  if (!ALLOWED_PAYMENT_METHODS.has(input.paymentMethod)) {
    throw new AppError(400, "Méthode de paiement invalide.");
  }

  const beneficiaryPhone = normalizePhone(input.beneficiaryPhone);
  if (!isValidIvorianPhone(beneficiaryPhone)) {
    throw new AppError(400, "Numéro bénéficiaire invalide.");
  }

  const pkg = await db.query.packagesTable.findFirst({
    where: and(
      eq(packagesTable.id, input.packageId),
      eq(packagesTable.isActive, true),
    ),
  });

  if (!pkg) {
    throw new AppError(404, "Forfait introuvable.");
  }

  const reference = buildReference();
  const success =
    Math.random() < env.paymentSimulatedSuccessRate;

  return db.transaction(async (tx) => {
    const account = await tx.query.accountsTable.findFirst({
      where: eq(accountsTable.userId, userId),
    });

    if (!account) {
      throw new AppError(404, "Compte portefeuille introuvable.");
    }

    if (success && account.balanceFcfa < pkg.priceFcfa) {
      throw new AppError(402, "Solde insuffisant.");
    }

    const [transaction] = await tx
      .insert(transactionsTable)
      .values({
        userId,
        packageId: pkg.id,
        beneficiaryPhone,
        amountFcfa: pkg.priceFcfa,
        paymentMethod: input.paymentMethod,
        status: success ? "success" : "failed",
        reference,
      })
      .returning();

    let walletBalance = account.balanceFcfa;

    if (success) {
      const [updatedAccount] = await tx
        .update(accountsTable)
        .set({
          balanceFcfa: sql`${accountsTable.balanceFcfa} - ${pkg.priceFcfa}`,
          updatedAt: new Date(),
        })
        .where(eq(accountsTable.userId, userId))
        .returning();

      walletBalance = updatedAccount.balanceFcfa;
    }

    return {
      transaction: {
        id: transaction.id,
        userId: transaction.userId,
        operator: pkg.operator,
        phone: transaction.beneficiaryPhone,
        packageName: pkg.name,
        data: pkg.dataLabel,
        amount: transaction.amountFcfa,
        paymentMethod: transaction.paymentMethod,
        status: transaction.status,
        transactionReference: transaction.reference,
        createdAt: transaction.createdAt.toISOString(),
      },
      walletBalance,
    };
  });
}

export async function listUserTransactions(userId: string) {
  const rows = await db
    .select({
      id: transactionsTable.id,
      userId: transactionsTable.userId,
      operator: packagesTable.operator,
      phone: transactionsTable.beneficiaryPhone,
      packageName: packagesTable.name,
      data: packagesTable.dataLabel,
      amount: transactionsTable.amountFcfa,
      paymentMethod: transactionsTable.paymentMethod,
      status: transactionsTable.status,
      transactionReference: transactionsTable.reference,
      createdAt: transactionsTable.createdAt,
    })
    .from(transactionsTable)
    .innerJoin(packagesTable, eq(transactionsTable.packageId, packagesTable.id))
    .where(eq(transactionsTable.userId, userId))
    .orderBy(desc(transactionsTable.createdAt));

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
  }));
}
