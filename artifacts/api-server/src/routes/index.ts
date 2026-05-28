import { Router, type IRouter } from "express";
import authRouter from "./auth";
import healthRouter from "./health";
import packagesRouter from "./packages";
import transactionsRouter from "./transactions";
import walletRouter from "./wallet";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/packages", packagesRouter);
router.use("/wallet", walletRouter);
router.use("/transactions", transactionsRouter);

export default router;
