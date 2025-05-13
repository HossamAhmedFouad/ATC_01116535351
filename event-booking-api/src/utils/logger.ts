/**
 * Logger utility for consistent logging throughout the application
 * Supports console and file-based logging with configurable log levels and log rotation
 */

import fs from "fs";
import path from "path";
import { createStream } from "rotating-file-stream";

// Define log levels and their priorities
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  HTTP = 3,
  DEBUG = 4,
}

// String representation of log levels
const LogLevelStrings = {
  [LogLevel.ERROR]: "ERROR",
  [LogLevel.WARN]: "WARN",
  [LogLevel.INFO]: "INFO",
  [LogLevel.HTTP]: "HTTP",
  [LogLevel.DEBUG]: "DEBUG",
};

// Get log level from environment or default to INFO
const getLogLevel = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();
  switch (envLevel) {
    case "ERROR":
      return LogLevel.ERROR;
    case "WARN":
      return LogLevel.WARN;
    case "INFO":
      return LogLevel.INFO;
    case "HTTP":
      return LogLevel.HTTP;
    case "DEBUG":
      return LogLevel.DEBUG;
    default:
      return LogLevel.INFO;
  }
};

// Current log level from environment
const currentLogLevel = getLogLevel();

// Get log directory from environment or default
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), "logs");

// Ensure log directory exists
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
} catch (error) {
  console.error("Failed to create log directory:", error);
}

// Create rotating file streams
const errorLogStream = createStream("error.log", {
  size: "10M", // Rotate every 10 megabytes
  interval: "1d", // Rotate daily
  path: LOG_DIR, // Log directory
  compress: "gzip", // Compress rotated files
  maxFiles: 14, // Keep logs for 14 days
});

const combinedLogStream = createStream("combined.log", {
  size: "10M", // Rotate every 10 megabytes
  interval: "1d", // Rotate daily
  path: LOG_DIR, // Log directory
  compress: "gzip", // Compress rotated files
  maxFiles: 7, // Keep logs for 7 days
});

class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Format a log message with timestamp, level, and context
   */
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${LogLevelStrings[level]}] [${this.context}] ${message}`;
  }

  /**
   * Write log to file
   * @param formattedMessage The formatted log message
   * @param level Log level
   */
  private writeToFile(formattedMessage: string, level: LogLevel): void {
    try {
      // Write to combined log
      combinedLogStream.write(formattedMessage + "\n");

      // Write errors to error log
      if (level === LogLevel.ERROR) {
        errorLogStream.write(formattedMessage + "\n");
      }
    } catch (error) {
      // Fall back to console if file writing fails
      console.error("Failed to write to log file:", error);
    }
  }

  /**
   * Log a message if the current log level allows it
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    // Skip if log level is higher than current setting
    if (level > currentLogLevel) return;

    const formattedMessage = this.formatMessage(level, message);

    // Log to console
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ...args);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage, ...args);
        break;
      default:
        console.log(formattedMessage, ...args);
    }

    // Write to log file
    this.writeToFile(
      formattedMessage +
        (args.length
          ? " " +
            args
              .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
              .join(" ")
          : ""),
      level
    );
  }

  /**
   * Log an error message
   */
  error(message: string, error?: any, ...args: any[]): void {
    let logMessage = message;
    const logArgs = [...args];

    // Add error details if provided
    if (error) {
      if (error instanceof Error) {
        logMessage += ` - ${error.message}`;
        // Add stack trace in non-production environments
        if (process.env.NODE_ENV !== "production") {
          logArgs.push(`\nStack: ${error.stack}`);
        }
      } else {
        logArgs.unshift(error);
      }
    }

    this.log(LogLevel.ERROR, logMessage, ...logArgs);
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  /**
   * Log an informational message
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  /**
   * Log HTTP requests (used by Morgan integration)
   */
  http(message: string, ...args: any[]): void {
    this.log(LogLevel.HTTP, message, ...args);
  }

  /**
   * Log a debug message
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }
}

/**
 * Create a new logger with the specified context
 * @param context The context for the logger (typically the class or file name)
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

// Default logger for direct imports
export default new Logger("App");
