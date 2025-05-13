import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/error";
import routes from "./routes";
import { setupSwagger } from "./utils/swagger";
import path from "path";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

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
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(
    `API Documentation available at http://localhost:${port}/api-docs`
  );
  console.log(`API Testing UI available at http://localhost:${port}/ui`);
});

export default app;
