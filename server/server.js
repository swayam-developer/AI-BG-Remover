import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./configs/mongodb.js";
import userRouter from "./routes/userRoutes.js";
import imageRouter from "./routes/ImageRoutes.js";
import bodyParser from "body-parser";
import mongoose from "mongoose";

dotenv.config(); // Load .env file

const startServer = async () => {
  // app config
  const PORT = process.env.PORT || 4000;
  const app = express();

  // Connect to the database using MONGODB_URI
  await connectDB();

  // Needed only for webhook route to handle raw body verification
  app.use("/api/user/webhook", bodyParser.raw({ type: "*/*" }));

  // Initialize middleware
  app.use(express.json());
  app.use(cors());

  // API routes
  app.get("/", (req, res) => {
    res.send("API working");
  });

  app.use("/api/user", userRouter);
  app.use('/api/image', imageRouter);

  // Start the server
  app.listen(PORT, () => console.log("Server is Running on PORT " + PORT));
};

// Call the startServer function
startServer();

mongoose.connect(process.env.MONGODB_URI, {
  // Removed deprecated options
})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to the database:", err));
