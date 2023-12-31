"use strict";
const router = require("express").Router();

// Call TODO Controller:
const user = require("../controllers/user");
const { isAdmin } = require("../middlewares/permissions");

router.route("/").get(isAdmin, user.list);
router.route("/forget-password").post(user.forgetPassword);
router.route("/reset-password/:uid/:emailToken").post(user.resetPassword);
router
  .route("/:id")
  .get(user.read)
  .put(user.update)
  .delete(isAdmin, user.delete);

module.exports = router;
