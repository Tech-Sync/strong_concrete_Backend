"use strict";

const router = require("express").Router();

const { isAdmin } = require("../middlewares/permissions");
const auth = require("../controllers/auth");
const user = require("../controllers/user");

router.post("/login", auth.login);
// Lee - only admin can create user
router.post("/register", isAdmin, user.register);
router.post("/refresh", auth.refresh);
router.all("/logout", auth.logout);

module.exports = router;
