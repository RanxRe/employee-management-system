import mongoose from "mongoose";
import { toTitleCase } from "../utils/toTitleCase.js";

const userSchema = mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["super_admin", "admin", "employee"],
      default: "employee",
    },
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      set: toTitleCase,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("users", userSchema);

export default User;
