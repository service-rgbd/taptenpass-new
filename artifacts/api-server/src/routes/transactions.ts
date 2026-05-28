import { Router, type IRouter } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  createTransaction,
  listUserTransactions,
} from "../services/users.service";

const router: IRouter = Router();

const createTransactionSchema = z.object({
  packageId: z.string().min(1, "Forfait requis."),
  beneficiaryPhone: z.string().trim().min(8, "Numéro bénéficiaire requis."),
  paymentMethod: z.enum(["wave", "orange_money", "mtn_money", "card"]),
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const transactions = await listUserTransactions(userId);
    res.json({ transactions });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  requireAuth,
  validateBody(createTransactionSchema),
  async (req, res, next) => {
    try {
      const { userId } = req as AuthenticatedRequest;
      const result = await createTransaction(userId, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
