import type { User } from "@/types";

export function normalizeUser(user: User): User {
  return {
    ...user,
    walletBalance: user.walletBalance ?? 0,
    totalRechargedFcfa: user.totalRechargedFcfa ?? 0,
    activeLoanGb: user.activeLoanGb ?? 0,
    loanRepaidPending: user.loanRepaidPending ?? false,
    loanEligible: user.loanEligible ?? (user.totalRechargedFcfa ?? 0) >= 10_000,
    loanMinRechargeFcfa: user.loanMinRechargeFcfa ?? 10_000,
    rechargeFeeRatePercent: user.rechargeFeeRatePercent ?? 1,
  };
}
