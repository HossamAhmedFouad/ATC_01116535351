import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { createLogger } from "../utils/logger";

// Create a logger for this middleware
const logger = createLogger("RequestLogger");

// Extend Express Request to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Middleware that logs all incoming requests and adds a request ID
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate a unique ID for this request
  const requestId = randomUUID();
  req.requestId = requestId;

  // Log the request details
  logger.info(
    `[${requestId}] ${req.method} ${req.originalUrl} - Client: ${req.ip}`
  );

  // Log request body if applicable
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
    // Sanitize sensitive data like passwords
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) {
      sanitizedBody.password = "[REDACTED]";
    }
    logger.debug(
      `[${requestId}] Request body: ${JSON.stringify(sanitizedBody)}`
    );
  }

  // Log when the response is sent
  const originalSend = res.send;
  res.send = function (body) {
    logger.info(`[${requestId}] Response: ${res.statusCode}`);
    return originalSend.call(this, body);
  };

  next();
};
