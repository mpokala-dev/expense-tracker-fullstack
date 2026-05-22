import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import expenseRoutes from "./routes/expenses";
import { errorHandler } from "./middleware/errorHandler";

// The app is exported separately from server.ts.
// Tests import this file to get the Express app without starting
// a real HTTP server or connecting to a real database.
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — useful for Docker and load balancers
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// 404 handler — catches any unmatched routes
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler must be last — Express identifies it by its 4-parameter signature
app.use(errorHandler);

export default app;
