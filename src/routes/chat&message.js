"use strict";
const router = require("express").Router();
const { chatList, chatDelete, messageCreate, groupCreate } = require("../controllers/chat&message");


router.route("/chat").get(chatList).post(groupCreate);
router.delete('/chat/:chatId', chatDelete)


router.route('/message')
    .post(messageCreate)




module.exports = router;
