"use strict";
const router = require("express").Router();
const chat = require("../controllers/chat");


router.route("/").get(chat.list);


module.exports = router;
