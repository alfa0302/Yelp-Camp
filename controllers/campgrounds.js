//imports
const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary/index");
const fetch = require("node-fetch");

//controllers
const index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

const renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

const createCampground = async (req, res) => {
  const { geometry } = req.body;
  const coordinates = geometry.coordinates.split(",").map(Number);
  console.log(req.body);
  const campground = new Campground(req.body.campground);

  campground.geometry = {
    type: "Point",
    coordinates: coordinates,
  };
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  req.flash("success", "Successfully created");
  res.redirect(`/campgrounds/${campground._id}`);
};

const showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Cannot find campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

const renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Cannot find campground");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

const updateCampground = async (req, res) => {
  const { id } = req.params;
  const { geometry } = req.body;
  const coordinates = geometry.coordinates.split(",").map(Number);
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  campground.geometry = {
    type: "Point",
    coordinates: coordinates,
  };
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs);
  if (req.body.deleteImages) {
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
  }
  console.log(campground);
  req.flash("success", "Successfully updated");
  res.redirect(`/campgrounds/${campground._id}`);
};

const deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted");
  res.redirect("/campgrounds");
};
module.exports = {
  index,
  renderNewForm,
  createCampground,
  showCampground,
  renderEditForm,
  updateCampground,
  deleteCampground,
};
