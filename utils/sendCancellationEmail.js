const nodemailer = require("nodemailer");

const sendCancellationEmail = async (booking, user, listing) => {

  // Gmail transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Beautiful HTML Email
  const htmlTemplate = `
    <div style="font-family: Arial; padding:20px; background:#f5f5f5;">
      
      <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:10px;">

        <h1 style="color:#fe424d; text-align:center;">
          Booking Cancelled ❌
        </h1>

        <p>Hello <b>${user.username}</b>,</p>

        <p>
          Your booking for 
          <b>${listing.title}</b> has been cancelled successfully.
        </p>

        <hr>

        <h3>Booking Details</h3>

        <p><b>Location:</b> ${listing.location}</p>
        <p><b>Price:</b> ₹${listing.price}</p>

        <hr>

        <p>
          We hope to host you again soon ❤️
        </p>

        <div style="text-align:center; margin-top:30px;">
          <a 
            href="http://localhost:8080/listings"
            style="
              background:#fe424d;
              color:white;
              padding:12px 20px;
              text-decoration:none;
              border-radius:8px;
            "
          >
            Explore More Listings
          </a>
        </div>

      </div>
    </div>
  `;

  // Email options
  const mailOptions = {
    from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Booking Cancellation Confirmation",
    html: htmlTemplate,
  };

  // Send mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendCancellationEmail;