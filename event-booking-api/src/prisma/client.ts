import { PrismaClient } from "@prisma/client";

// Add BigInt serialization for JSON responses
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// Create a singleton instance of PrismaClient to ensure proper connection pooling
const prisma = new PrismaClient();

// Handle connection errors
prisma
  .$connect()
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  });

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Disconnected from database");
  process.exit(0);
});

export default prisma;
