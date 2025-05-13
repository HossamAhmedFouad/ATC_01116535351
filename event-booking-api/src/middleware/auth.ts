import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt";
import { createLogger } from "../utils/logger";

// Create a logger for this middleware
const logger = createLogger("AuthMiddleware");

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authentication middleware that verifies JWT tokens
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn(
        `Authentication failed: No Bearer token in request from ${req.ip}`
      );
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token
    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      logger.warn(`Authentication failed: Invalid token from ${req.ip}`);
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    // Add the user information to the request
    req.user = decodedToken;
    logger.debug(
      `User authenticated: ${decodedToken.userId} (${decodedToken.email})`
    );
    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};

/**
 * Authorization middleware that checks if the user has the required role
 * @param allowedRoles Roles that are allowed to access the resource
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      logger.warn(`Authorization failed: No user in request from ${req.ip}`);
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        `Authorization failed: User ${req.user.userId} with role ${
          req.user.role
        } attempted to access a resource requiring ${allowedRoles.join(", ")}`
      );
      res.status(403).json({
        message: "You do not have permission to access this resource",
      });
      return;
    }

    logger.debug(
      `User ${req.user.userId} authorized with role ${req.user.role}`
    );
    next();
  };
};
