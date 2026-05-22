import { Router } from "express";
import * as authController from "../controllers/authController";
import { registerRules, loginRules, validate } from "../middleware/validation";

const router = Router();

// POST /api/auth/register
router.post("/register", registerRules, validate, authController.register);

// POST /api/auth/login
router.post("/login", loginRules, validate, authController.login);

export default router;
