import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  createLeaveBalance,
  getAllLeaveBalances,
  getMyLeaveBalances,
} from "../controllers/leaveBalance.controller.js";

const leaveBalanceRouter = express.Router();

leaveBalanceRouter.post("/", authenticate, authorize("admin", "super_admin"), createLeaveBalance);
leaveBalanceRouter.get("/", authenticate, authorize("admin", "super_admin"), getAllLeaveBalances);
leaveBalanceRouter.get("/my", authenticate, authorize("employee"), getMyLeaveBalances);

export default leaveBalanceRouter;
