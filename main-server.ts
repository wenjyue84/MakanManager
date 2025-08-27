import express from "express";
import { registerRoutes } from "./server/routes";
import { setupVite, serveStatic } from "./server/vite";

const app = express();
app.use(express.json());

async function main() {
  const server = await registerRoutes(app);

  // setup vite in development mode
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = process.env.PORT || 5000;
  
  server.listen(PORT, () => {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    console.log(`${formattedTime} [express] Server running at http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});