import { Router, type IRouter } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { getWallet } from "../services/users.service";
import {
  getLoanStatus,
  initiateWalletRecharge,
  requestDataLoan,
  verifyWalletRecharge,
} from "../services/wallet.service";

const router: IRouter = Router();

const rechargeSchema = z.object({
  amountFcfa: z.number().int().min(500, "Montant minimum : 500 FCFA."),
});

const verifyRechargeSchema = z.object({
  reference: z.string().trim().min(4, "Référence requise."),
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const wallet = await getWallet(userId);
    res.json(wallet);
  } catch (error) {
    next(error);
  }
});

router.get("/loan", requireAuth, async (req, res, next) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const loan = await getLoanStatus(userId);
    res.json(loan);
  } catch (error) {
    next(error);
  }
});

router.post("/loan", requireAuth, async (req, res, next) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const loan = await requestDataLoan(userId);
    res.status(201).json(loan);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/recharge/initiate",
  requireAuth,
  validateBody(rechargeSchema),
  async (req, res, next) => {
    try {
      const { userId } = req as AuthenticatedRequest;
      const result = await initiateWalletRecharge(userId, req.body.amountFcfa);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/recharge/verify",
  requireAuth,
  validateBody(verifyRechargeSchema),
  async (req, res, next) => {
    try {
      const { userId } = req as AuthenticatedRequest;
      const result = await verifyWalletRecharge(userId, req.body.reference);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
