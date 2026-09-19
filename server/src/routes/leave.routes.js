import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { createLeave } from "../controllers/leave.controller.js";

export const leaveRouter = express.Router();

leaveRouter.post("/", authenticate, authorize("employee"), createLeave);
