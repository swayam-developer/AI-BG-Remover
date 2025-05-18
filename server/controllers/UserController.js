import { Webhook } from "svix";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import transactionModel from "../models/transactionModel.js";
import dotenv from "dotenv";
dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Clerk webhook for user create/update/delete
const clerkWebhooks = async (req, res) => {
  try {
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };
    let evt;
    try {
      const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
      evt = webhook.verify(req.body, headers);
    } catch {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }
    const { data, type } = evt;
    if (!data || !data.id || !data.email_addresses || !data.image_url)
      return res.status(400).json({ success: false, message: "Invalid payload" });

    if (type === "user.created" || type === "user.updated") {
      await userModel.findOneAndUpdate(
        { clerkId: data.id },
        {
          clerkId: data.id,
          email: data.email_addresses[0]?.email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else if (type === "user.deleted") {
      await userModel.findOneAndDelete({ clerkId: data.id });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Upsert user info on login/signup (client calls this after Clerk login)
const upsertUserOnLogin = async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, photo } = req.body;
    if (!clerkId || !email || !photo) {
      return res.status(400).json({ success: false, message: "Missing required user fields" });
    }
    const user = await userModel.findOneAndUpdate(
      { clerkId },
      { clerkId, email, firstName, lastName, photo },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user credits (auth required)
const userCredits = async (req, res) => {
  try {
    // Accept clerkId from either req.body or req.clerkId (set by auth middleware)
    const clerkId = req.body.clerkId || req.clerkId;
    if (!clerkId) return res.status(400).json({ success: false, message: "clerkId required" });
    const user = await userModel.findOne({ clerkId });
    res.json({ success: true, credits: user?.creditBalance || 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Razorpay payment order creation (auth required)
const paymentRazorpay = async (req, res) => {
  try {
    const { clerkId, planId } = req.body;
    if (!clerkId || !planId) {
      return res.status(400).json({ success: false, message: "clerkId and planId are required" });
    }
    const user = await userModel.findOne({ clerkId });
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    let credits, amount, plan;
    switch (planId) {
      case "Basic":
        credits = 100;
        amount = 10;
        plan = "Basic";
        break;
      case "Advanced":
        credits = 500;
        amount = 50;
        plan = "Advanced";
        break;
      case "Business":
        credits = 5000;
        amount = 250;
        plan = "Business";
        break;
      default:
        return res.json({ success: false, message: "Invalid plan" });
    }

    let transaction;
    try {
      transaction = await transactionModel.create({
        clerkId,
        plan,
        credits,
        amount,
        date: Date.now(),
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Transaction creation failed" });
    }

    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY,
      receipt: transaction._id.toString(),
    };

    razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }
      res.json({ success: true, order });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Razorpay payment verification and credit addition
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    if (!razorpay_order_id) {
      return res.status(400).json({ success: false, message: "razorpay_order_id is required" });
    }
    const order = await razorpayInstance.orders.fetch(razorpay_order_id);
    const transaction = await transactionModel.findById(order.receipt);

    if (!transaction || transaction.payment) {
      return res.json({
        success: false,
        message: "Invalid or duplicate transaction",
      });
    }

    const user = await userModel.findOne({ clerkId: transaction.clerkId });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    user.creditBalance += transaction.credits;
    await user.save();

    transaction.payment = true;
    await transaction.save();

    res.json({ success: true, message: "Credits added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  clerkWebhooks,
  userCredits,
  paymentRazorpay,
  verifyRazorpay,
  upsertUserOnLogin,
};
