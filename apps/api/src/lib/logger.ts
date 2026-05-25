import pino from "pino";
import { env } from "cloudflare:workers";

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    censor: "[REDACTED]",
    paths: [
      "authorization",
      "cookie",
      "password",
      "token",
      "secret",
      "accessToken",
      "refreshToken",
      "clientSecret",
      "*.authorization",
      "*.cookie",
      "*.password",
      "*.token",
      "*.secret",
      "*.accessToken",
      "*.refreshToken",
      "*.clientSecret",
    ],
  },
});

export type AppLogger = typeof logger;

export const createRequestLogger = (requestId: string): AppLogger =>
  logger.child({ requestId });
