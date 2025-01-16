const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");
const {
  renderRegister,
  register,
  renderLogin,
  login,
  logout,
} = require("../controllers/users");

router.route("/register").get(renderRegister).post(catchAsync(register));
router
  .route("/login")
  .get(renderLogin)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    login
  );
router.get("/logout", logout);
module.exports = router;
