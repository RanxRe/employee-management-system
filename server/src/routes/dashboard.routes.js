import express from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

import { getDashboardStats } from "../controllers/dashboard.controller.js";

export const dashboardRouter = express.Router();

dashboardRouter.get("/stats", authenticate, authorize("admin", "super_admin"), getDashboardStats);
