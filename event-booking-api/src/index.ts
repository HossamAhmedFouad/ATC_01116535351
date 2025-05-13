import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/error";
import routes from "./routes";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", routes);

// Error Handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
