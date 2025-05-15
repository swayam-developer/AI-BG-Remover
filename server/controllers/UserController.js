import { Webhook } from "svix";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import transactionModel from "../models/transactionModel.js";

dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const clerkWebhooks = async (req, res) => {
  try {
    const payload = req.body;
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = webhook.verify(payload, headers);
    const { data, type } = evt;

    // Debugging logs to inspect the payload
    console.log("Webhook payload data:", data);

    if (!data || !data.id || !data.email_addresses || !data.image_url) {
      console.log("Invalid webhook payload:", data);
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    switch (type) {
      case "user.created":
        await userModel.create({
          clerkId: data.id,
          email: data.email_addresses[0]?.email_address,
          firstName: data.first_name, // Ensure this field exists in the payload
          lastName: data.last_name,   // Ensure this field exists in the payload
          photo: data.image_url,
        });
        console.log("User created:", data.id);
        break;

      case "user.updated":
        await userModel.findOneAndUpdate(
          { clerkId: data.id },
          {
            email: data.email_addresses[0]?.email_address,
            firstName: data.first_name,
            lastName: data.last_name,
            photo: data.image_url,
          }
        );
        console.log("User updated:", data.id);
        break;

      case "user.deleted":
        await userModel.findOneAndDelete({ clerkId: data.id });
        console.log("User deleted:", data.id);
        break;

      default:
        console.log("Unhandled webhook event type:", type);
        break;
    }

    res.json({ success: true });
  } catch (error) {
    console.log("Webhook Error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

const userCredits = async (req, res) => {
  try {
    const { clerkId } = req.body;
    const user = await userModel.findOne({ clerkId });
    res.json({ success: true, credits: user?.creditBalance || 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const paymentRazorpay = async (req, res) => {
  try {
    const { clerkId, planId } = req.body;
    const user = await userModel.findOne({ clerkId });

    if (!user || !planId) {
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

    const transaction = await transactionModel.create({
      clerkId,
      plan,
      credits,
      amount,
      date: Date.now(),
    });

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

const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const order = await razorpayInstance.orders.fetch(razorpay_order_id);
    const transaction = await transactionModel.findById(order.receipt);

    if (!transaction || transaction.payment) {
      return res.json({
        success: false,
        message: "Invalid or duplicate transaction",
      });
    }

    const user = await userModel.findOne({ clerkId: transaction.clerkId });
    user.creditBalance += transaction.credits;
    await user.save();

    transaction.payment = true;
    await transaction.save();

    res.json({ success: true, message: "Credits added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const someFunction = async (req, res) => {
  try {
    const { token } = req.body || {}; // Safely destructure token
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }
    // ...existing code...
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { clerkWebhooks, userCredits, paymentRazorpay, verifyRazorpay, someFunction };
