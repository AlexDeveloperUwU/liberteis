import pino from "pino";
import pinoHttp from "pino-http";

const createFileTransport = (filePath, isJson = false, colorize = false) => ({
  target: isJson ? "pino/file" : "pino-pretty",
  level: "info",
  options: {
    destination: filePath,
    mkdir: true,
    colorize,
    singleLine: true,
    translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
    ignore: "pid,hostname",
  },
});

const consoleTransport = {
  target: "pino-pretty",
  level: "info",
  options: {
    colorize: true,
    singleLine: true,
    translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
    ignore: "pid,hostname",
  },
};

const logger = pino({
  level: "info",
  transport: {
    targets: [
      consoleTransport,
      createFileTransport("data/logs/combined.log", false, false),
      createFileTransport("data/logs/app.log", true),
    ],
  },
});

const httpLogger = pinoHttp({
  logger: pino({
    level: "info",
    transport: {
      targets: [
        consoleTransport,
        createFileTransport("data/logs/combined.log", false, false),
        createFileTransport("data/logs/http.log", true),
      ],
    },
  }),
});

const testsLogger = pino({
  level: "info",
  transport: {
    targets: [
      createFileTransport("data/logs/tests.log", false, false),
    ],
  },
});

export { logger, httpLogger, testsLogger };
