const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const Booking = require("../models/booking");
// const sendEmail = require("../utils/sendEmail");
const PDFDocument = require("pdfkit");
const sendInvoiceEmail = require("../utils/sendInvoiceEmail");
const sendCancellationEmail = require("../utils/sendCancellationEmail");


router.post("/:id", async (req, res) => {
  try {
    if (!req.user) {
      req.flash("error", "Please login first!");
      return res.redirect("/login");
    }

    let listing = await Listing.findById(req.params.id);
    let user = req.user;

    // ✅ booking create AFTER payment
    let newBooking = new Booking({
      user: user._id,
      listing: listing._id,
      checkIn: req.body.checkIn,
      checkOut: req.body.checkOut,
      totalPrice: req.body.totalPrice,
    });

    await newBooking.save();

    // 📩 invoice email
    await sendInvoiceEmail(newBooking, user, listing);

    req.flash("success", "Booking successful!");
    res.sendStatus(200);

  } catch (err) {
    console.log(err);
    res.status(500).send("error");
  }
});


router.get("/my", async (req, res) => {
  if (!req.user) {
    req.flash("error", "Please login first!");
    return res.redirect("/login");
  }

  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing");

  res.render("bookings/my", { bookings });
});

router.post("/cancel/:id", async (req, res) => {
  try {

    // booking find karo
    const booking = await Booking.findById(req.params.id)
      .populate("user")
      .populate("listing");

    if (!booking) {
      req.flash("error", "Booking not found!");
      return res.redirect("/bookings/my");
    }

    // 🔥 cancellation email send
    await sendCancellationEmail(
      booking,
      booking.user,
      booking.listing
    );

    // booking delete
    await Booking.findByIdAndDelete(req.params.id);

    req.flash("success", "Booking cancelled & email sent!");
    res.redirect("/bookings/my");

  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong!");
    res.redirect("/bookings/my");
  }
});



// Invoice Download Route
router.get("/:id/invoice", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("listing");

    if (!booking) {
      req.flash("error", "Booking not found!");
      return res.redirect("/listings");
    }

    // PDF setup
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${booking._id}.pdf`
    );

    doc.pipe(res);

    // ===== Invoice Design =====
    doc.fontSize(20).text("Booking Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Booking ID: ${booking._id}`);
    doc.text(`User: ${req.user ? req.user.username : "Guest"}`);
    doc.text(`Listing: ${booking.listing.title}`);
    doc.text(`Location: ${booking.listing.location}`);
    doc.text(`Price per night: ₹${booking.listing.price}`);

    doc.moveDown();
    doc.text(`Check-in: ${booking.checkIn}`);
    doc.text(`Check-out: ${booking.checkOut}`);
    doc.text(`Total Price: ₹${booking.totalPrice}`);

    doc.moveDown();
    doc.text("Thank you for booking with us ❤️", {
      align: "center",
    });

    doc.end();
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong!");
    res.redirect("/listings");
  }
});

router.post("/:id", async (req, res) => {
  try {
    if (!req.user) {
      req.flash("error", "Please login first!");
      return res.redirect("/login");
    }

    let listing = await Listing.findById(req.params.id);
    let user = req.user;

    let newBooking = new Booking({
      user: user._id,
      listing: listing._id,
      checkIn: req.body.checkIn,
      checkOut: req.body.checkOut,
      totalPrice: req.body.totalPrice,
    });

    await newBooking.save();

    // 🔥 AUTO EMAIL INVOICE
    await sendInvoiceEmail(newBooking, user, listing);

    req.flash("success", "Booking done + Invoice sent to email!");
    res.redirect("/bookings/my?success=true");
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong!");
    res.redirect("/listings");
  }
});

module.exports = router;