import { Request, Response, NextFunction } from "express";
import { createLogger } from "../utils/logger";

// Create a logger for errors
const logger = createLogger("ErrorHandler");

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handling middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = (err as AppError).statusCode || 500;
  const message = err.message || "Internal server error";

  // Log the error
  if (statusCode >= 500) {
    logger.error(`${statusCode} Error: ${message}`, err);
  } else {
    logger.warn(`${statusCode} Error: ${message}`);
  }

  if (process.env.NODE_ENV === "development") {
    logger.debug(`Error stack: ${err.stack}`);
  }

  // Include request information in detailed logs
  logger.debug(
    `Error occurred on ${req.method} ${req.originalUrl} from ${req.ip}`
  );

  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
