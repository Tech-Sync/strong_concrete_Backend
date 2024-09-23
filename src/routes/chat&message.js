"use strict";
const router = require("express").Router();
const chat = require("../controllers/chat&message");


router.route("/")
    .get(chat.list)
    .post(chat.create);

router.route('/:id')
    .post(chat.create)
    .delete(chat.delete)


module.exports = router;
