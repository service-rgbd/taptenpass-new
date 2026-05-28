import { db } from "@workspace/db";
import {
  accountsTable,
  usersTable,
  walletTopupsTable,
} from "@workspace/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { env } from "../lib/env";
import { AppError } from "../lib/errors";

export const RECHARGE_FEE_RATE = 0.01;
export const LOAN_MIN_RECHARGE_FCFA = 10_000;
export const LOAN_AMOUNT_GB = 1;

function buildTopupReference(): string {
  return `RCH${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function computeRechargeFee(amountFcfa: number): number {
  return Math.ceil(amountFcfa * RECHARGE_FEE_RATE);
}

async function getAccountOrThrow(userId: string) {
  const account = await db.query.accountsTable.findFirst({
    where: eq(accountsTable.userId, userId),
  });

  if (!account) {
    throw new AppError(404, "Compte portefeuille introuvable.");
  }

  return account;
}

async function getUserOrThrow(userId: string) {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });

  if (!user || !user.isActive) {
    throw new AppError(404, "Utilisateur introuvable.");
  }

  return user;
}

async function initializePaystackTransaction(input: {
  email: string;
  amountFcfa: number;
  reference: string;
}) {
  if (!env.paystackSecretKey) {
    return {
      authorizationUrl: null as string | null,
      paystackReference: input.reference,
      simulated: true,
    };
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountFcfa,
      currency: "XOF",
      reference: input.reference,
    }),
  });

  const payload = (await response.json()) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string; reference?: string };
  };

  if (!response.ok || !payload.status || !payload.data?.authorization_url) {
    throw new AppError(502, payload.message ?? "Impossible d'initialiser Paystack.");
  }

  return {
    authorizationUrl: payload.data.authorization_url,
    paystackReference: payload.data.reference ?? input.reference,
    simulated: false,
  };
}

async function verifyPaystackTransaction(reference: string) {
  if (!env.paystackSecretKey) {
    return Math.random() < env.paymentSimulatedSuccessRate;
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${env.paystackSecretKey}`,
      },
    },
  );

  const payload = (await response.json()) as {
    status?: boolean;
    data?: { status?: string };
  };

  return response.ok && payload.status === true && payload.data?.status === "success";
}

export async function initiateWalletRecharge(userId: string, amountFcfa: number) {
  if (!Number.isInteger(amountFcfa) || amountFcfa < 500) {
    throw new AppError(400, "Montant minimum de recharge : 500 FCFA.");
  }

  const user = await getUserOrThrow(userId);
  const feeFcfa = computeRechargeFee(amountFcfa);
  const totalPaidFcfa = amountFcfa + feeFcfa;
  const reference = buildTopupReference();
  const email = user.email.trim() || `${user.phone}@taptenpass.ci`;

  const paystack = await initializePaystackTransaction({
    email,
    amountFcfa: totalPaidFcfa,
    reference,
  });

  const [topup] = await db
    .insert(walletTopupsTable)
    .values({
      userId,
      amountFcfa,
      feeFcfa,
      totalPaidFcfa,
      status: "pending",
      reference,
      paystackReference: paystack.paystackReference,
      paymentMethod: "paystack",
    })
    .returning();

  return {
    topupId: topup.id,
    reference: topup.reference,
    amountFcfa,
    feeFcfa,
    totalPaidFcfa,
    feeRatePercent: RECHARGE_FEE_RATE * 100,
    authorizationUrl: paystack.authorizationUrl,
    simulated: paystack.simulated,
  };
}

export async function verifyWalletRecharge(userId: string, reference: string) {
  const topup = await db.query.walletTopupsTable.findFirst({
    where: and(
      eq(walletTopupsTable.reference, reference),
      eq(walletTopupsTable.userId, userId),
    ),
  });

  if (!topup) {
    throw new AppError(404, "Recharge introuvable.");
  }

  if (topup.status === "success") {
    const account = await getAccountOrThrow(userId);
    return {
      status: "success" as const,
      amountFcfa: topup.amountFcfa,
      feeFcfa: topup.feeFcfa,
      totalPaidFcfa: topup.totalPaidFcfa,
      walletBalance: account.balanceFcfa,
      loanRepaid: false,
    };
  }

  if (topup.status === "failed") {
    throw new AppError(402, "Recharge échouée.");
  }

  const verified = await verifyPaystackTransaction(
    topup.paystackReference ?? topup.reference,
  );

  if (!verified) {
    await db
      .update(walletTopupsTable)
      .set({ status: "failed" })
      .where(eq(walletTopupsTable.id, topup.id));
    throw new AppError(402, "Paiement Paystack non confirmé.");
  }

  return db.transaction(async (tx) => {
    const account = await tx.query.accountsTable.findFirst({
      where: eq(accountsTable.userId, userId),
    });

    if (!account) {
      throw new AppError(404, "Compte portefeuille introuvable.");
    }

    const loanRepaid = account.loanRepaidPending && account.activeLoanGb > 0;

    const [updatedAccount] = await tx
      .update(accountsTable)
      .set({
        balanceFcfa: sql`${accountsTable.balanceFcfa} + ${topup.amountFcfa}`,
        totalRechargedFcfa: sql`${accountsTable.totalRechargedFcfa} + ${topup.amountFcfa}`,
        activeLoanGb: loanRepaid ? 0 : account.activeLoanGb,
        loanRepaidPending: loanRepaid ? false : account.loanRepaidPending,
        updatedAt: new Date(),
      })
      .where(eq(accountsTable.userId, userId))
      .returning();

    await tx
      .update(walletTopupsTable)
      .set({ status: "success" })
      .where(eq(walletTopupsTable.id, topup.id));

    return {
      status: "success" as const,
      amountFcfa: topup.amountFcfa,
      feeFcfa: topup.feeFcfa,
      totalPaidFcfa: topup.totalPaidFcfa,
      walletBalance: updatedAccount.balanceFcfa,
      loanRepaid,
    };
  });
}

export async function getLoanStatus(userId: string) {
  const account = await getAccountOrThrow(userId);

  return {
    minRechargeFcfa: LOAN_MIN_RECHARGE_FCFA,
    totalRechargedFcfa: account.totalRechargedFcfa,
    eligible: account.totalRechargedFcfa >= LOAN_MIN_RECHARGE_FCFA,
    activeLoanGb: account.activeLoanGb,
    loanRepaidPending: account.loanRepaidPending,
    loanAmountGb: LOAN_AMOUNT_GB,
    remainingToEligible: Math.max(
      0,
      LOAN_MIN_RECHARGE_FCFA - account.totalRechargedFcfa,
    ),
  };
}

export async function requestDataLoan(userId: string) {
  const account = await getAccountOrThrow(userId);

  if (account.totalRechargedFcfa < LOAN_MIN_RECHARGE_FCFA) {
    throw new AppError(
      403,
      `Rechargez au moins ${LOAN_MIN_RECHARGE_FCFA.toLocaleString("fr-CI")} FCFA pour accéder au prêt.`,
    );
  }

  if (account.activeLoanGb > 0) {
    throw new AppError(409, "Un prêt de données est déjà actif.");
  }

  const [updatedAccount] = await db
    .update(accountsTable)
    .set({
      activeLoanGb: LOAN_AMOUNT_GB,
      loanRepaidPending: true,
      updatedAt: new Date(),
    })
    .where(eq(accountsTable.userId, userId))
    .returning();

  return {
    loanGb: LOAN_AMOUNT_GB,
    activeLoanGb: updatedAccount.activeLoanGb,
    loanRepaidPending: updatedAccount.loanRepaidPending,
    message: `${LOAN_AMOUNT_GB} Go activé. Remboursez en rechargeant votre solde.`,
  };
}

export function buildWalletProfile(account: typeof accountsTable.$inferSelect) {
  return {
    totalRechargedFcfa: account.totalRechargedFcfa,
    activeLoanGb: account.activeLoanGb,
    loanRepaidPending: account.loanRepaidPending,
    loanEligible: account.totalRechargedFcfa >= LOAN_MIN_RECHARGE_FCFA,
    loanMinRechargeFcfa: LOAN_MIN_RECHARGE_FCFA,
    rechargeFeeRatePercent: RECHARGE_FEE_RATE * 100,
  };
}
