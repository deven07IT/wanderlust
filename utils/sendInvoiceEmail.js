// const nodemailer = require("nodemailer");
// const PDFDocument = require("pdfkit");

// const sendInvoiceEmail = async (booking, user, listing) => {
//   return new Promise((resolve, reject) => {
//     try {
//       const doc = new PDFDocument();
//       let buffers = [];

//       doc.on("data", buffers.push.bind(buffers));

//       doc.on("end", async () => {
//         const pdfData = Buffer.concat(buffers);

//         // Gmail transporter
//         const transporter = nodemailer.createTransport({
//           service: "gmail",
//           auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//           },
//         });

//         const mailOptions = {
//           from: `"Booking System" <${process.env.EMAIL_USER}>`,
//           to: user.email,
//           subject: "Your Booking Invoice",
//           text: "Thanks for your booking! Invoice attached below.",
//           attachments: [
//             {
//               filename: `invoice-${booking._id}.pdf`,
//               content: pdfData,
//             },
//           ],
//         };

//         await transporter.sendMail(mailOptions);

//         resolve(true);
//       });

//       // ===== PDF CONTENT =====
//       doc.fontSize(20).text("Booking Invoice", { align: "center" });
//       doc.moveDown();

//       doc.fontSize(12).text(`Booking ID: ${booking._id}`);
//       doc.text(`Customer: ${user.username}`);
//       doc.text(`Hotel: ${listing.title}`);
//       doc.text(`Location: ${listing.location}`);
//       doc.text(`Price: ₹${listing.price}`);

//       doc.moveDown();
//       doc.text(`Check-in: ${booking.checkIn || "N/A"}`);
//       doc.text(`Check-out: ${booking.checkOut || "N/A"}`);
//       doc.text(`Total: ₹${booking.totalPrice || "N/A"}`);

//       doc.moveDown();
//       doc.text("Thank you for booking ❤️", { align: "center" });

//       doc.end();
//     } catch (err) {
//       reject(err);
//     }
//   });
// };

// module.exports = sendInvoiceEmail;

const nodemailer = require("nodemailer");

const sendInvoiceEmail = async (booking, user, listing) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Booking System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Booking Invoice 🧾",

      // 🔥 BEAUTIFUL HTML EMAIL
      html: `
      <div style="font-family:Arial; background:#f4f4f4; padding:20px;">
        
        <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:10px;">
          
          <h2 style="text-align:center; color:#ff385c;">
            🧾 Booking Invoice
          </h2>

          <p>Hi <b>${user.username}</b>,</p>
          <p>Your booking is confirmed. Here are the details:</p>

          <hr/>

          <h3>🏨 Hotel Info</h3>
          <p><b>${listing.title}</b></p>
          <p>${listing.location}</p>

          <h3>📅 Booking Details</h3>
          <p><b>Check-in:</b> ${booking.checkIn || "N/A"}</p>
          <p><b>Check-out:</b> ${booking.checkOut || "N/A"}</p>

          <h3>💰 Payment</h3>
          <p style="font-size:18px;">
            <b>Total Price:</b> ₹${booking.totalPrice || "N/A"}
          </p>

          <div style="text-align:center; margin-top:20px;">
            <p style="color:green; font-weight:bold;">
              ✅ Booking Confirmed Successfully
            </p>
          </div>

          <hr/>

          <p style="text-align:center; font-size:12px; color:gray;">
            Thank you for choosing us ❤️
          </p>

        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ HTML invoice email sent");

  } catch (err) {
    console.log("❌ Email error:", err);
  }
};

module.exports = sendInvoiceEmail;