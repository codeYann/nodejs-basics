import pino from "pino";

export const logger = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      levelFirst: true,
      colorizer: true,
    },
  },
});
