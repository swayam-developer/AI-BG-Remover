import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected");
    });
    mongoose.connection.on("error", (err) => {
      console.error("Database connection error:", err.message);
    });
    await mongoose.connect(`${process.env.MONGODB_URI}`, { // Using MONGODB_URI from .env
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1); // Exit the process if the database connection fails
  }
};
export default connectDB;
