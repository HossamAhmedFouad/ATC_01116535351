import { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Event Booking API",
      version: "1.0.0",
      description: "API documentation for the Event Booking system",
      contact: {
        name: "API Support",
        email: "support@eventbookingapi.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/swagger/*.ts"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  // Serve swagger docs
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

  // Serve swagger in JSON format
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });
}
