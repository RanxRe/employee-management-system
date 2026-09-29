import mongoose from "mongoose";
import { toTitleCase } from "../utils/toTitleCase.js";

const designationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      set: toTitleCase,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

const Designation = mongoose.model("designations", designationSchema);

export default Designation;
