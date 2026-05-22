import app from "./app";
import { connectDB } from "./config/database";
import { config } from "./config/env";

async function start(): Promise<void> {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
