"use strict";
const router = require("express").Router();
const { chatList, chatDelete, messageCreate, groupCreate, messageList, groupUpdate } = require("../controllers/chat&message");


router.route("/chat").get(chatList)
router.delete('/chat/:chatId', chatDelete)

router.post("/chat/group", groupCreate)
router.route('/chat/group/:groupId')
    .patch(groupUpdate)


router.route('/message')
    .post(messageCreate)

router.route('/message/:chatId')
    .get(messageList)




module.exports = router;
