import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { normalizePhone } from "../lib/phone";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/users.service";

const router: IRouter = Router();

const registerSchema = z.object({
  fullname: z.string().trim().min(2, "Nom complet requis."),
  phone: z.string().trim().min(8, "Numéro de téléphone requis."),
  email: z.string().trim().email("Email invalide.").optional().or(z.literal("")),
  password: z.string().min(6, "Mot de passe trop court."),
});

const loginSchema = z.object({
  phone: z.string().trim().min(8, "Numéro de téléphone requis."),
  password: z.string().min(1, "Mot de passe requis."),
});

const checkPhoneSchema = z.object({
  phone: z.string().trim().min(8, "Numéro de téléphone requis."),
});

router.post("/check-phone", validateBody(checkPhoneSchema), async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.phone, phone),
    });
    res.json({ exists: !!user?.isActive });
  } catch (error) {
    next(error);
  }
});

router.post("/register", validateBody(registerSchema), async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const user = await getCurrentUser(userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
