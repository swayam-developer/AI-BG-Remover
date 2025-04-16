import express from "express";
import { removeBgImage } from "../controllers/ImageController";
import upload from "../middleware/multer";
import authUser from "../middleware/auth";

const imageRouter = express.Router();

imageRouter.post("/remove-bg", upload.single("image"), authUser, removeBgImage);

export default imageRouter;
