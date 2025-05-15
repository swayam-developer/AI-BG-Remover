import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./configs/mongodb.js";
import userRouter from "./routes/userRoutes.js";
import imageRouter from "./routes/ImageRoutes.js";
import bodyParser from "body-parser";

dotenv.config(); // Load .env file

const startServer = async () => {
  // app config
  const PORT = process.env.PORT || 4000;
  const app = express();

  // Initialize middleware
  app.use(express.json()); // Ensure JSON payloads are parsed

  // Connect to the database using MONGODB_URI
  await connectDB();

  // Initialize middleware
  app.use(cors());

  // Needed only for webhook route to handle raw body verification
  app.use("/api/user/webhook", bodyParser.raw({ type: "*/*" }));

  // API routes
  app.get("/", (req, res) => {
    res.send("API working");
  });

  app.use("/api/user", userRouter);
  app.use("/api/image", imageRouter);

  // Start the server
  app.listen(PORT, () => console.log("Server is Running on PORT " + PORT));
};

// Call the startServer function
startServer();

