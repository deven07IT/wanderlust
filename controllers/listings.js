const Listing = require("../models/listing");
const axios = require("axios");


// module.exports.index = async (req, res) => {
//   const allListings = await Listing.find({});
//   res.render("listings/index.ejs", { allListings });
// };

module.exports.index = async (req, res) => {

  let search = req.query.search;

  if (search) {

    const listing = await Listing.findOne({
      $or: [
        {
          title: {
            $regex: search,
            $options: "i"
          }
        },
        {
          location: {
            $regex: search,
            $options: "i"
          }
        },
        {
          country: {
            $regex: search,
            $options: "i"
          }
        }
      ]
    });

    // 🔥 direct open
    if (listing) {
      return res.redirect(`/listings/${listing._id}`);
    }
  }

  const allListings = await Listing.find({});
  console.log("LISTINGS:", allListings);

  res.render("listings/index.ejs", {
    allListings
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// module.exports.showListing = async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id)
//   .populate({
//     path: "reviews", 
//     populate: { 
//       path:"author",
//     },
//   })
//   .populate({
//   path: "owner",
//   select: "username mobile"
// });
//     if(!listing) {
//       req.flash("error", "listing you requested for does not exist!");
//      return res.redirect("/listings");
//     }
//     console.log(listing);
//   res.render("listings/show.ejs", { listing });
// };

module.exports.showListing = async (req, res) => {

  let { id } = req.params;

  const listing = await Listing.findById(id)
  

    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })

    .populate({
      path: "owner",
      select: "username mobile",
    });

  if (!listing) {

    req.flash(
      "error",
      "Listing does not exist!"
    );

    return res.redirect("/listings");

  }
  console.log("GEOMETRY:", listing.geometry);

  // WEATHER

  let weatherData = null;

  try {

    const apiKey =
    process.env.WEATHER;
    

    const weatherURL =

    `https://api.openweathermap.org/data/2.5/weather?q=${listing.location},${listing.country}&appid=${apiKey}&units=metric`;

    const response =
    await axios.get(weatherURL);

    weatherData = {

      temp:
      response.data.main.temp,

      feels:
      response.data.main.feels_like,

      humidity:
      response.data.main.humidity,

      wind:
      response.data.wind.speed,

      condition:
      response.data.weather[0].main,

      icon:
      response.data.weather[0].icon,

    };

  }

  catch (err) {

    console.log(
      "Weather Error:",
      err.message
    );

  }

  res.render(
    "listings/show.ejs",
    {
      listing,
      weatherData,
    }
  );

};


// module.exports.createListing = async (req, res, next) => {
 
//   req.body.listing.title = req.body.listing.title || "Default Title";
// req.body.listing.price = Number(req.body.listing.price) || 0;
//      let url = req.file.path;
//      let filename = req.file.filename;
//      const newListing = new Listing(req.body.listing);
//      newListing.owner = req.user._id;
//      newListing.image = { url, filename };
//      await newListing.save();
//      req.flash("success", "New Listing Created!");
//      res.redirect("/listings");
// };


// module.exports.createListing = async (req, res, next) => {

//   req.body.listing.title =
//   req.body.listing.title ||
//   "Default Title";

//   req.body.listing.price =
//   Number(req.body.listing.price) || 0;

//   if (!req.body.listing.location || !req.body.listing.country) {
//   req.flash("error", "Location and country are required!");
//   return res.redirect("/listings/new");
// }

//   // IMAGE

//   let url = req.file.path;

//   let filename =
//   req.file.filename;

//   // NEW LISTING

//   const newListing =
//   new Listing(req.body.listing);

//   newListing.owner =
//   req.user._id;

//   newListing.image = {
//     url,
//     filename
//   };

//   await newListing.save();

//   req.flash(
//     "success",
//     "New Listing Created!"
//   );

//   res.redirect(
//     `/listings/${newListing._id}`
//   );

// };


module.exports.createListing = async (req, res) => {

  req.body.listing.title =
    req.body.listing.title || "Default Title";

  req.body.listing.price =
    Number(req.body.listing.price) || 0;

  // 1️⃣ LOCATION STRING
  let locationText =
    `${req.body.listing.location}, ${req.body.listing.country}`;

  try {

    // 2️⃣ FREE GEOCODING (NO API KEY)
const geoResponse = await axios.get(
  "https://nominatim.openstreetmap.org/search",
  {
    params: {
      q: locationText,
      format: "json",
      limit: 1,
      addressdetails: 1,
    },
    headers: {
      "User-Agent": "Wanderlust-App (devenpatel1683@gmail.com)"
    }
  }
);

    if (!geoResponse.data || geoResponse.data.length === 0) {
  req.flash("error", "Location not found! Please enter detailed location (City, State, Country)");
  return res.redirect("/listings/new");
}

    const geoData = geoResponse.data[0];

    // 3️⃣ CREATE LISTING
    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };

    // 4️⃣ SAVE COORDINATES (IMPORTANT)
    newListing.geometry = {
      type: "Point",
      coordinates: [
        parseFloat(geoData.lon),
        parseFloat(geoData.lat)
      ]
    };

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);

  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong!");
    res.redirect("/listings/new");
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing) {
      req.flash("error", "listing you requested for does not exist!");
     return res.redirect("/listings");
    }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250,h_160");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// module.exports.updateListing = async (req, res) => {

//   req.body.listing.title = req.body.listing.title || "Default Title";
// req.body.listing.price = Number(req.body.listing.price) || 0;
 
//   let { id } = req.params;
//   let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

//   if(typeof req.file !== "undefined") {
//   let url = req.file.path;
//   let filename = req.file.filename;
//   listing.image = { url, filename };
//   await listing.save();
//   }
//   req.flash("success", "Listing Updated!");
//   res.redirect(`/listings/${id}`);
// };

module.exports.updateListing = async (req, res) => {

  req.body.listing.title =
    req.body.listing.title || "Default Title";

  req.body.listing.price =
    Number(req.body.listing.price) || 0;

  let { id } = req.params;

  // LOCATION STRING
  let locationText =
    `${req.body.listing.location}, ${req.body.listing.country}`;

  try {

    // GEOCODING
    const geoResponse = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: locationText,
          format: "json",
          limit: 1,
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "Wanderlust-App"
        }
      }
    );

    let geometry = null;

    if (geoResponse.data && geoResponse.data.length > 0) {

      const geoData = geoResponse.data[0];

      geometry = {
        type: "Point",
        coordinates: [
          parseFloat(geoData.lon),
          parseFloat(geoData.lat)
        ]
      };

    }

    // UPDATE LISTING
    let listing = await Listing.findByIdAndUpdate(
      id,
      {
        ...req.body.listing,
        geometry
      },
      { new: true }
    );

    // IMAGE UPDATE
    if (typeof req.file !== "undefined") {

      let url = req.file.path;
      let filename = req.file.filename;

      listing.image = { url, filename };

      await listing.save();

    }

    req.flash("success", "Listing Updated!");

    res.redirect(`/listings/${id}`);

  }

  catch (err) {

    console.log(err);

    req.flash("error", "Something went wrong!");

    res.redirect(`/listings/${id}/edit`);

  }

};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};