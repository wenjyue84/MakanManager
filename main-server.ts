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

  const PORT = Number(process.env.PORT) || 5000;
  const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  
  server.listen(PORT, HOST, () => {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    console.log(`${formattedTime} [express] Server running at http://${HOST}:${PORT}`);
  });
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});