import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(rootDir, "../../.env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(rootDir, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
