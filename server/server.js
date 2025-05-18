import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./configs/mongodb.js";
import userRouter from "./routes/userRoutes.js";
import imageRouter from "./routes/ImageRoutes.js";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Clerk webhook: must use raw body
app.use("/api/user/webhooks", bodyParser.raw({ type: "*/*" }));

app.use(express.json());
app.use(cors());

await connectDB();

app.get("/", (req, res) => res.send("API working"));

app.use("/api/user", userRouter);
app.use("/api/image", imageRouter);

app.listen(PORT, () => console.log("Server is Running on PORT " + PORT));

