const express = require("express");
const router = express.Router();

const User = require("../models/user");

router.get("/", async (req, res) => {

  if (!req.user) {
    return res.redirect("/login");
  }

  const user = await User.findById(req.user._id)
    .populate("wishlist");

  res.render("wishlist/index", {
    wishlist: user.wishlist
  });

});

// TEST ROUTE
router.get("/test", (req, res) => {
  res.send("wishlist working");
});

// ADD / REMOVE WISHLIST
router.post("/:id", async (req, res) => {

  try {

    if (!req.user) {
      return res.json({
        success: false,
        message: "Login first"
      });
    }

    const user = await User.findById(req.user._id);

    const listingId = req.params.id;

    const exists = user.wishlist.includes(listingId);

    if (exists) {

      user.wishlist.pull(listingId);

    } else {

      user.wishlist.push(listingId);

    }

    await user.save();

    res.json({
      success: true,
      wishlisted: !exists
    });

  } catch (err) {

    console.log(err);

    res.json({
      success: false
    });

  }

});

module.exports = router;