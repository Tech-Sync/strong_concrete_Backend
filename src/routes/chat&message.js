"use strict";
const router = require("express").Router();
const { chatList, chatDelete, messageCreate, groupCreate, messageList, groupUpdate, readChat, MessageChatCreate } = require("../controllers/chat&message");
const permissions = require("../middlewares/permissions");
const upload = require("../middlewares/upload");


if (process.env.NODE_ENV !== 'development') {
    router.use(permissions.isLogin);
}

router.route("/").get(chatList)
router.route('/:chatId')
    .delete(chatDelete)
    .get(readChat)

router.post("/group", upload.single('chatPicture'), groupCreate)
router.route('/group/:groupId').patch(groupUpdate)


router.route('/message/:chatId')
    .get(messageList)
    .post(MessageChatCreate)



module.exports = router;
