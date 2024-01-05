"use strict";

const router = require("express").Router();

const auth = require("../controllers/auth");

router.post("/login", auth.login);
router.all("/verify-email", auth.verifyEmail);
router.post("/register", auth.register); // only admin can create a user
router.post("/refresh", auth.refresh);
router.all("/logout", auth.logout);

module.exports = router;
