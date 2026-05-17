require("dotenv").config();
require("events").EventEmitter.defaultMaxListeners = 20;


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash= require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const bookingRoutes = require("./routes/bookings");
const http = require("http");
const { Server } = require("socket.io");
const Listing = require("./models/listing");
const Message = require("./models/message");
const paymentRoutes = require("./routes/payment");
const wishlistRoutes = require("./routes/wishlist.js");

const server = http.createServer(app);
const io = new Server(server);

const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;


main().then(()=>{
    console.log("connect to db");
}).catch((err) => {
    console.log(err);
});


async function main() {
    await mongoose.connect(dbUrl);
}

app.get("/" , (req,res) =>{
    res.send("run server");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
}, 
 touchAfter : 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized: true,
    cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// app.get("/", (req,res) => {
//   res.send("Hi, I am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// app.use((req, res, next) => {
//   res.locals.success = req.flash("success");
//   res.locals.error = req.flash("error");
//   res.locals.currUser = req.user;
//   next();
// });

app.use(async (req, res, next) => {

  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  if (req.user) {

    const fullUser = await User.findById(req.user._id)
      .populate("wishlist");

    res.locals.currUser = fullUser;

  } else {

    res.locals.currUser = null;

  }

  next();

});

// app.get("/demouser", async (req, res) =>{
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student"
//   });

//   let registeredUser = await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);
// });


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/payment", paymentRoutes);


app.use("/bookings", bookingRoutes);
app.use("/wishlist", wishlistRoutes);

app.get("/chat/:id", async (req, res) => {

  if (!req.user) {
    req.flash("error", "Please login first!");
    return res.redirect("/login");
  }

  const listing = await Listing.findById(req.params.id).populate("owner");

  const userId = req.user._id.toString();
  const ownerId = listing.owner._id.toString();

  // 🔥 room generate (same for both users)
  const room = [userId, ownerId, listing._id].sort().join("_");

  res.render("chat", {
    listing,
    room,
    currUser: req.user
  });
});

async function makeAdmin() {
  await User.updateOne(
    { username: "deven" }, 
    { role: "admin" }
  );
}

// makeAdmin();




// 404 handler
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Some Error Occured!" } = err;
  res.status(statusCode).render("error", { message });
});

// app.get("/chat", (req, res) => {
//   res.render("chat");
// });

io.on("connection", (socket) => {

  socket.on("joinRoom", async (room) => {
    socket.join(room);

    // 🔥 old messages send
    const messages = await Message.find({ room });
    socket.emit("loadMessages", messages);
  });

  socket.on("sendMessage", async (data) => {

    const msg = await Message.create(data);

    io.to(data.room).emit("receiveMessage", msg);
  });

});

server.listen(8080, () => {
  console.log("Server running on 8080");
});

// app.post("/listings", wrapAsync(async (req, res) => {

//   const newListing = new Listing({
//     ...req.body.listing,
//     image: {
//       url: req.body.listing.image?.url || "https://upload.wikimedia.org/wikipedia/commons/d/d1/The_future_%28Unsplash%29.jpg",
//       filename: "listingimage"
//     },
//     price: req.body.listing.price || 0
//   });

//   await newListing.save();
//   res.redirect("/listings");
// }));