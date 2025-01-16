if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
const Reviews = require("../models/review");
const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  await Reviews.deleteMany({});
  for (let i = 0; i < 100; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const choice = cities[random1000];
    const camp = new Campground({
      //My user id
      author: "67893dbf6013d32858591e32",
      location: `${choice.city}, ${choice.state}`,
      geometry: {
        type: "Point",
        coordinates: [choice.latitude, choice.longitude] || [
          -113.1331, 47.0202,
        ],
      },
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dz7pizbh1/image/upload/v1736585697/Camp/mheyigyv2eyszkqzxenz.jpg",
          filename: "Camp/mheyigyv2eyszkqzxenz",
        },
      ],
      description:
        "Escape the hustle and bustle and immerse yourself in nature's beauty at this serene campground. Perfect for adventure seekers and relaxation lovers alike!",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
