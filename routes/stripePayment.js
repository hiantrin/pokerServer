import express from "express";
import mongoose from "mongoose";
import Stripe from "stripe";
import checkToken from "../middlewares/checkToken.js";
import dotenv from "dotenv";
import bodyParser from "body-parser";

const router = express.Router();
const db = mongoose.connection;

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    console.log(
      "process.env.STRIPE_WEBHOOK_SECRET",
      process.env.STRIPE_WEBHOOK_SECRET
    );
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("⚠️  Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        savePaymentToDatabase(paymentIntent);
        console.log("💰 PaymentIntent succeeded:", paymentIntent.id);
        break;

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object;
        console.log("❌ PaymentIntent failed:", failedPaymentIntent.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
  }
);

router.post(
  "/create-payment-intent",
  bodyParser.json(),
  checkToken,
  async (req, res) => {
    const { amount, userId } = req.body;

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        metadata: {
          userId,
        },
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error("Error creating Payment Intent:", error);
      res.status(500).json({
        error: error.message,
      });
    }
  }
);

const savePaymentToDatabase = async (paymentIntent) => {
  console.log("PaymentIntent", paymentIntent);
};

export default router;
