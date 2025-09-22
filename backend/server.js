import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import peoRoutes from "./routes/peoRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import finalResultRoutes from "./routes/finalResultRoutes.js";
import mlRoutes from "./routes/mlRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
const allowedOrigins = [
  "https://plo-peo-1.onrender.com",
  "http://localhost:5173"
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to the database
connectDB();

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/peo", peoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/final-result", finalResultRoutes);
app.use("/api/ml", mlRoutes);

app.get("/", (req, res) => {
  res.send("PLO Analysis System API is running...");
});

// Health endpoint for deploy checks
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
