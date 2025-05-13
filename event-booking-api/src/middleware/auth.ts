import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt";

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
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token
    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    // Add the user information to the request
    req.user = decodedToken;

    next();
  } catch (error) {
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
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res
        .status(403)
        .json({
          message: "You do not have permission to access this resource",
        });
      return;
    }

    next();
  };
};
