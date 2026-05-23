import { app } from "./app";
import { env } from "./env";
import { logger } from "./lib/logger";

app.listen(env.PORT);

logger.info(
  {
    port: env.PORT,
    swaggerUrl: `http://localhost:${env.PORT}/swagger`,
  },
  "API server started"
);
