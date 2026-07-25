import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma/prisma.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Basic Route for Testing

app.get("/", (req, res) => {
  res.send("SN Travel API Server is running smoothly! 🚀");
});
app.use("/api/users", userRoutes);
// Database Connection Check
async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL via Prisma!");

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
}

main();
