import mongoose from "mongoose";
import { config } from "./env";

// Separated from server.ts so tests can connect to an in-memory DB
// without importing the whole Express app.
export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
