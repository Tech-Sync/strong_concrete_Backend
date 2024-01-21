"use strict";

const router = require("express").Router();
const auth = require("../controllers/auth");
const permissions = require('../middlewares/permissions')

router.post("/login", auth.login);
router.get("/verify-email", auth.verifyEmail);
router.post("/register", auth.register); // only admin can create a user
router.post("/refresh",permissions.isLogin, auth.refresh);
router.get("/logout", auth.logout);

module.exports = router;
