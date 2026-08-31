import JWT from "jsonwebtoken";

import { ENV } from "../utils/env.js";
import User from "../models/User.model.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = JWT.verify(token, ENV.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Your account is not active.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
