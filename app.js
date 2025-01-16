if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//imports
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
// const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const session = require("express-session");
const mongoStore = require("connect-mongo");

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

const User = require("./models/user");

const dbUrl = process.env.DB_URL;
// const dbUrl = "mongodb://localhost:27017/yelp-camp";

//express app
const app = express();

//mongoose connection
mongoose.connect(dbUrl);
// mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

//settings
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const store = mongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60, //24 hrs
  crypto: {
    secret: "thisshouldbeabettersecret!",
  },
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR");
});

//session middleware
app.use(
  session({
    store,
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());
//specify strategy used
passport.use(new LocalStrategy(User.authenticate()));
//specify storing and unstoring methods
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//helmet
app.use(helmet());
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://unpkg.com/leaflet@1.9.4/dist/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://unpkg.com",
];
const styleSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://unpkg.com/leaflet@1.9.4/dist/",
  "https://kit-free.fontawesome.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://unpkg.com",
];
const connectSrcUrls = ["'self'", "https://*.basemaps.cartocdn.com"];
const fontSrcUrls = [];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'"],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dz7pizbh1/",
        "https://images.unsplash.com/",
        "https://unpkg.com/leaflet@1.9.4/dist/images/",
        "https://*.basemaps.cartocdn.com",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

//flash middleware
app.use(flash());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//routes
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
