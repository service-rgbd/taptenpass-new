import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../",
);

config({ path: path.join(rootDir, ".env") });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required but was not provided.`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? "8080"),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  initialWalletBalance: Number(process.env.INITIAL_WALLET_BALANCE ?? "5000"),
  paymentSimulatedSuccessRate: Number(
    process.env.PAYMENT_SIMULATED_SUCCESS_RATE ?? "0.9",
  ),
};
