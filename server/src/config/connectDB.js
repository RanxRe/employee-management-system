import mongoose from "mongoose";
import { ENV } from "../utils/env.js";

export async function connectDB() {
  try {
    const conn = await mongoose.connect(`${ENV.MONGO_URI}/${ENV.DB_NAME}`);
    console.log("MongoDB connected successfully :", conn.connection.name);
  } catch (error) {
    console.error("Error in MongoDB connection: ", error);
    process.exit(1);
  }
}
