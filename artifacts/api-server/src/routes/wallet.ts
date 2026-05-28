import { Router, type IRouter } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { getWallet } from "../services/users.service";

const router: IRouter = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const wallet = await getWallet(userId);
    res.json(wallet);
  } catch (error) {
    next(error);
  }
});

export default router;
