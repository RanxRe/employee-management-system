import mongoose from "mongoose";

// function to capitalize the first letter
const toTitleCase = (val) => {
  if (typeof val !== "string") return val;
  return val
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required."],
      unique: true,
      trim: true,
      set: toTitleCase,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

const Department = mongoose.model("departments", departmentSchema);

export default Department;
