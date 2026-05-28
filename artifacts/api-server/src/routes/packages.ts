import { Router, type IRouter } from "express";
import type { Package } from "@workspace/db/schema";
import { listActivePackages } from "../services/packages.service";

const router: IRouter = Router();

router.get("/", async (_req, res, next) => {
  try {
    const packages = await listActivePackages();
    res.json({
      packages: packages.map((pkg: Package) => ({
        id: pkg.id,
        operator: pkg.operator,
        name: pkg.name,
        data: pkg.dataLabel,
        price: pkg.priceFcfa,
        validity: pkg.validity,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
