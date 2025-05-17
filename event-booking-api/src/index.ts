import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import morgan from "morgan";
import { errorHandler } from "./middleware/error";
import { requestLogger } from "./middleware/request-logger";
import routes from "./routes";
import { setupSwagger } from "./utils/swagger";
import path from "path";
import logger, { createLogger } from "./utils/logger";
import prisma from "./prisma/client";

// Load environment variables
dotenv.config();

// Create a Express app
const app = express();
const port = process.env.PORT || 3000;

// Create custom morgan format with our logger
morgan.token("timestamp", () => new Date().toISOString());

// Create custom morgan stream that uses our logger
const morganLogger = createLogger("HTTP");
const morganStream = {
  write: (message: string) => {
    // Remove newline from the end of Morgan's message
    morganLogger.http(message.trim());
  },
};

// Define format for HTTP logging
const morganFormat =
  ":method :url :status - :response-time ms :res[content-length]";

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "localhost:3000"],
      },
    },
  })
);
app.use(
  cors({
    origin: [
      "https://atc-01116535351.vercel.app", // Production frontend
      "http://localhost:4200", // Local development frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true, // ✅ if you're using auth headers or cookies
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Setup request loggers
app.use(morgan(morganFormat, { stream: morganStream })); // HTTP request logging with custom format
app.use(requestLogger); // Custom detailed request logging

// Root route - API information and redirection to docs
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to the Event Booking API",
    version: "1.0.0",
    documentation: "/api-docs",
    endpoints: {
      base: "/api",
      users: "/api/users",
      events: "/api/events",
      bookings: "/api/bookings",
    },
  });
});

// UI route - direct to API tester UI
app.get("/ui", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// API Routes
app.use("/api", routes);

// Setup Swagger UI
setupSwagger(app);

// Error Handler
app.use(errorHandler);

// Start server
app.listen(3000, "0.0.0.0", async () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(
    `API Documentation available at http://localhost:${port}/api-docs`
  );
  logger.info(`API Testing UI available at http://localhost:${port}/ui`);

  // Test database connection
  try {
    await prisma.$connect();
    logger.info("Successfully connected to the database");
  } catch (error) {
    logger.error("Failed to connect to the database:", error);
  }
});

export default app;
