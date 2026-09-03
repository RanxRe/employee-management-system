import express from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

export const testRouter = express.Router();

testRouter.get("/protected", authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "You accessed a protected route.",
    user: req.user,
  });
});

testRouter.get("/admin", authenticate, authorize("admin"), (req, res) => {
  return res.status(200).json({
    success: true,
    message: "You accessed an admin-only route.",
    user: req.user,
  });
});

testRouter.get("/super-admin", authenticate, authorize("super_admin"), (req, res) => {
  return res.status(200).json({
    success: true,
    message: "You accessed a super-admin-only route.",
    user: req.user,
  });
});
