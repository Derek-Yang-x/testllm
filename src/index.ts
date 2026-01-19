
import "dotenv/config";
import express from "express";
import { fileURLToPath } from 'url';
import { initializeDb, getSchema } from "./db.js";
import routes from "./routes/index.js";

export const app = express();
app.use(express.json());

export function setupRoutes() {
  app.use(routes);
}

async function startServer() {
  await initializeDb();
  // Warm up the schema cache
  await getSchema();
  setupRoutes();
  app.listen(process.env.PORT || 3000, () => console.log(`Server is running on http://localhost:3000`));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}