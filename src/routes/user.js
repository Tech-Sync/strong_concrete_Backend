"use strict";
const router = require("express").Router();

// Call TODO Controller:
const user = require("../controllers/user");
const { isAdmin } = require("../middlewares/permissions");

router.route("/").get(isAdmin, user.list);
router.route("/:id").get(user.read).put(user.update).delete(isAdmin, user.delete);
router.route("/updatePassword").post(user.uptadePassword);
router.route("/restore/:id").all(user.restore);
router.route("/forget-password").post(user.forgetPassword);
router.route("/reset-password/:uid/:emailToken").post(user.resetPassword);

module.exports = router;
