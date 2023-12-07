import colors from "picocolors";
import util from "util";

export const messageLevelFnMap = {
  info: (message: string) => message,
  warn: (message: string) => colors.yellow(message),
  error: (message: string) => colors.red(message),
  success: (message: string) => colors.green(message),
};

interface LoggerOptions {
  timestamp?: boolean;
  tag?: string;
}

export interface Logger {
  info(...message: any[]): void;
  warn(...message: any[]): void;
  error(...message: any[]): void;
  success(...message: any[]): void;
  colors: typeof colors;
}
type LogLevel = keyof typeof messageLevelFnMap;

export default function createLogger(options: LoggerOptions = {}): Logger {
  const { timestamp = true, tag = "" } = options;
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  function output(level: LogLevel, message: any[]) {
    console.log(
      `${timestamp ? `${colors.dim(timeFormatter.format(new Date()))} ` : ""}${
        tag ? `${colors.magenta(colors.bold(`[${tag}]`))} ` : ""
      }`,
      messageLevelFnMap[level](util.format.apply(null, message))
    );
  }

  const logger: Logger = {
    info(...message: any[]) {
      output("info", message);
    },
    warn(...message: any[]) {
      output("warn", message);
    },
    error(...message: any[]) {
      output("error", message);
    },
    success(...message: any[]) {
      output("success", message);
    },
    colors,
  };
  return logger;
}
