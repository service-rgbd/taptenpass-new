import "./bootstrap";
import app from "./app";
import { env } from "./lib/env";
import { logger } from "./lib/logger";
import { seedPackages } from "./services/packages.service";

async function start() {
  await seedPackages();

  app.listen(env.port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port: env.port }, "Server listening");
  });
}

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
