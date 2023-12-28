"use strict";
const router = require("express").Router();

// Call TODO Controller:
const user = require("../controllers/user");

router.route("/").get(user.list).post(user.create);

router.route("/:id").get(user.read).put(user.update).delete(user.delete);

module.exports = router;
