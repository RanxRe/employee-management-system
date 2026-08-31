import express from "express";

import { authenticate } from "../middlewares/auth.middleware.js";

export const testRouter = express.Router();

testRouter.get("/protected", authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "You accessed a protected route.",
    user: req.user,
  });
});
