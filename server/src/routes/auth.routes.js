import express from "express";
import { signIn, signUp } from "../controllers/auth.controller.js";

export const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
