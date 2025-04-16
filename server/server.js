import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./configs/mongodb.js";
import userRouter from "./routes/userRoutes.js";
import imageRouter from "./routes/ImageRoutes.js";

dotenv.config();

// app config
const PORT = process.env.PORT || 4000;
const app = express();
await connectDB();

// Initialize middleware
app.use(express.json());
app.use(cors());

// api routes
app.get("/", (req, res) => {
  res.send("API working");
});

app.use("/api/user", userRouter);

app.use('/api/image',imageRouter);

app.listen(PORT, () => console.log("Server is Running on PORT " + PORT));
