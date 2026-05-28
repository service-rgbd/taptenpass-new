import { Router, type IRouter } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
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
