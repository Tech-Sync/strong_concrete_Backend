"use strict";
const router = require("express").Router();

// Call TODO Controller:
const user = require("../controllers/user");
const { isAdmin } = require("../middlewares/permissions");

router.route("/").get(isAdmin, user.list);
router.all("/verify-email", user.verifyEmail);
router
  .route("/:id")
  .get(user.read)
  .put(user.update)
  .delete(isAdmin, user.delete);

module.exports = router;
