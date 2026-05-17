const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// create order
router.post("/create-order", async (req, res) => {
  const options = {
    amount: req.body.amount * 100, // paise
    currency: "INR",
    receipt: "receipt_order_1"
  };

  const order = await instance.orders.create(options);

  res.json(order);
});

module.exports = router;