const nodemailer = require("nodemailer");

const sendEmail = async (userEmail, listing) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Reservation Confirmed",
    text: `You have successfully reserved "${listing.title}" on Wanderlust.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;