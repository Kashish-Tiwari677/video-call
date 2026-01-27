// backend/src/routes/users.routes.js

import { Router } from "express";
import {
  login,
  register,
  getUserHistory,
  addToHistory,
  authenticate,
} from "../controllers/user.controller.js";

const router = Router();

// PUBLIC ROUTES
router.post("/login", login);
router.post("/register", register);

// PROTECTED ROUTES
router.get("/get_all_activity", authenticate, getUserHistory);
router.post("/add_to_activity", authenticate, addToHistory);

export default router;
