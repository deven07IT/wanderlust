// const mongoose =  require("mongoose");
// const Schema = mongoose.Schema;

// const listingSchema = new Schema({
//   title: {
//     type: String,
//     required: true,
//   },
//   description: String,

//   image: {
//     filename: {
//       type: String,
//       default: "listingimage",
//     },
//     url: {
//       type: String,
//       default:
//         "https://upload.wikimedia.org/wikipedia/commons/d/d1/The_future_%28Unsplash%29.jpg",
//       set: (v) =>
//         v === ""
//           ? "https://upload.wikimedia.org/wikipedia/commons/d/d1/The_future_%28Unsplash%29.jpg"
//           : v,
//     },
//   },

//   price: Number,
//   location: String,
//   country: String,
// });

// const Listing = mongoose.model("Listing", listingSchema);
// module.exports = Listing;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    // required: true,
  },

  description: String,

  image: {
   url: String,
   filename: String,
  },

  price: {
    type: Number,
    // required: true,
    default: 0,
  },

  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
geometry: {
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    type: [Number],
    required: true,
  },
},

});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
