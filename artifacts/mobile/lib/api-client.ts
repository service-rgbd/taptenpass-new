import { API_BASE_URL } from "@/constants/api";
import { normalizePhone } from "@/constants/phone";
import type { Transaction, User } from "@/types";
import { clearToken, getToken, setToken } from "./token-storage";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const token = await getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data: { message?: string } | null = null;

  if (text) {
    try {
      data = JSON.parse(text) as { message?: string };
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(data?.message ?? "Une erreur est survenue.", response.status);
  }

  return (data ?? {}) as T;
}

interface AuthResponse {
  token: string;
  user: User;
}

export async function checkPhoneExists(phone: string): Promise<boolean> {
  const result = await apiFetch<{ exists: boolean }>("/api/auth/check-phone", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ phone: normalizePhone(phone) }),
  });
  return result.exists;
}

export async function registerUser(input: {
  fullname: string;
  phone: string;
  password: string;
}): Promise<AuthResponse> {
  const result = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    auth: false,
    body: JSON.stringify({
      fullname: input.fullname,
      phone: normalizePhone(input.phone),
      password: input.password,
    }),
  });
  await setToken(result.token);
  return result;
}

export async function loginUser(input: {
  phone: string;
  password: string;
}): Promise<AuthResponse> {
  const result = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({
      phone: normalizePhone(input.phone),
      password: input.password,
    }),
  });
  await setToken(result.token);
  return result;
}

export async function fetchCurrentUser(): Promise<User> {
  const result = await apiFetch<{ user: User }>("/api/auth/me");
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await clearToken();
}

export async function updateUserProfile(input: {
  fullname?: string;
  email?: string;
}): Promise<User> {
  const result = await apiFetch<{ user: User }>("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return result.user;
}

export async function initiateWalletRecharge(amountFcfa: number): Promise<{
  reference: string;
  amountFcfa: number;
  feeFcfa: number;
  totalPaidFcfa: number;
  feeRatePercent: number;
  authorizationUrl: string | null;
  simulated: boolean;
}> {
  return apiFetch("/api/wallet/recharge/initiate", {
    method: "POST",
    body: JSON.stringify({ amountFcfa }),
  });
}

export async function verifyWalletRecharge(reference: string): Promise<{
  status: "success";
  amountFcfa: number;
  feeFcfa: number;
  totalPaidFcfa: number;
  walletBalance: number;
  loanRepaid: boolean;
}> {
  return apiFetch("/api/wallet/recharge/verify", {
    method: "POST",
    body: JSON.stringify({ reference }),
  });
}

export async function fetchLoanStatus(): Promise<{
  minRechargeFcfa: number;
  totalRechargedFcfa: number;
  eligible: boolean;
  activeLoanGb: number;
  loanRepaidPending: boolean;
  loanAmountGb: number;
  remainingToEligible: number;
}> {
  return apiFetch("/api/wallet/loan");
}

export async function requestDataLoan(): Promise<{
  loanGb: number;
  activeLoanGb: number;
  loanRepaidPending: boolean;
  message: string;
}> {
  return apiFetch("/api/wallet/loan", { method: "POST" });
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const result = await apiFetch<{ transactions: Transaction[] }>("/api/transactions");
  return result.transactions;
}

export async function createTransaction(input: {
  packageId: string;
  beneficiaryPhone: string;
  paymentMethod: string;
}): Promise<{ transaction: Transaction; walletBalance: number }> {
  return apiFetch("/api/transactions", {
    method: "POST",
    body: JSON.stringify({
      packageId: input.packageId,
      beneficiaryPhone: normalizePhone(input.beneficiaryPhone),
      paymentMethod: input.paymentMethod,
    }),
  });
}
