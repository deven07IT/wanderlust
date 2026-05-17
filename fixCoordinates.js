const mongoose = require("mongoose");
const axios = require("axios");

const Listing = require("./models/listing");

main()
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

async function fixCoordinates() {

  const listings = await Listing.find({});

  for (let listing of listings) {

    try {

      const locationText =
        `${listing.location}, ${listing.country}`;

      const geoResponse = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: locationText,
            format: "json",
            limit: 1,
          },
          headers: {
            "User-Agent": "Wanderlust-App"
          }
        }
      );

      if (
        geoResponse.data &&
        geoResponse.data.length > 0
      ) {

        const geoData =
          geoResponse.data[0];

        listing.geometry = {
          type: "Point",
          coordinates: [
            parseFloat(geoData.lon),
            parseFloat(geoData.lat)
          ]
        };

        await listing.save();

        console.log(
          `Updated: ${listing.title}`
        );

      } else {

        console.log(
          `Location not found: ${listing.title}`
        );

      }

    } catch (err) {

      console.log(
        `Error in ${listing.title}`
      );

    }

  }

  mongoose.connection.close();

}

fixCoordinates();