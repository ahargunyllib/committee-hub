import { env } from "cloudflare:workers";
import { app } from "./app";
import { logger } from "./lib/logger";

app.listen(env.PORT);

logger.info(
  {
    port: env.PORT,
    swaggerUrl: `http://localhost:${env.PORT}/swagger`,
  },
  "API server started"
);
