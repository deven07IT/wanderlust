const express = require("express");
const router = express.Router();

const Listing = require("../models/listing");
const Message = require("../models/message");

// CHAT PAGE
router.get("/:listingId", async (req, res) => {

  if (!req.user) {
    req.flash("error", "Please login first!");
    return res.redirect("/login");
  }

  const listing = await Listing.findById(req.params.listingId)
    .populate("owner");

  const messages = await Message.find({
    listing: listing._id
  }).populate("sender");

  res.render("chat/chat", {
    listing,
    messages
  });
});

// SEND MESSAGE
router.post("/:listingId", async (req, res) => {

  if (!req.user) {
    req.flash("error", "Please login first!");
    return res.redirect("/login");
  }

  const listing = await Listing.findById(req.params.listingId);

  const newMessage = new Message({
    sender: req.user._id,
    receiver: listing.owner,
    listing: listing._id,
    text: req.body.text
  });

  await newMessage.save();

  res.redirect(`/chat/${listing._id}`);
});

module.exports = router;