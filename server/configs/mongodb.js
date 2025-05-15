import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected successfully");
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("Database disconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Database connection error:", err.message);
    });

    await mongoose.connect(`${process.env.MONGODB_URI}/bg-removal`);

    console.log("MongoDB connection established");
  } catch (error) {
    if (error.message.includes("bad auth")) {
      console.error("Authentication failed: Please check your MONGODB_URI credentials.");
    } else {
      console.error("Failed to connect to the database:", error.message);
    }
    process.exit(1); // Exit the process if the database connection fails
  }
};

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Database connection closed due to app termination");
  process.exit(0);
});

export default connectDB;
