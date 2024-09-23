const { Chat, Message, ChatUsers, ReadReceipts, User } = require('../models/associations');
const sequelize = require('sequelize');

module.exports = {
    list: async (req, res) => {

        const userChatIds = await ChatUsers.findAll({ where: { UserId: req.user.id }, attributes: ['ChatId'] });

        const chatIds = userChatIds.map(chatUser => chatUser.ChatId);

        const userChats = await Chat.findAll({
            where: { id: chatIds },
            include: [{
                model: User,
                as: 'chatUsers',
                through: { attributes: [] },
                attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic', 'phoneNo', 'role', 'email'],
            }],
        });


        res.status(200).send({
            details: await req.getModelListDetails(Chat),
            userChats,
        });
    },

    create: async (req, res) => {
        let chat
        let chatUsers;
        const { userIds, ...chatData } = req.body
        const receiverId = req.params.id
        const currentUserId = req.user.id;

        if (receiverId) {

            const existingChat = await Chat.findOne({
                where: { isGroupChat: false },
                include: [
                    {
                        model: User,
                        as: 'chatUsers',
                        through: { attributes: [] },
                        where: { id: [currentUserId, receiverId] },
                    }
                ],
                group: ['Chat.id'],  // Ensure the results are grouped to avoid duplicates
            });



            if (existingChat) {
                return res.status(200).send({
                    message: 'Chat already exists between these users.',
                    chat: existingChat,
                });
            }

            chatData.chatName = null

            chat = await Chat.create(chatData)


            const chatUsersData = [{ UserId: receiverId, ChatId: chat.id }, { UserId: req.user.id, ChatId: chat.id }]
            
            chatUsers = await ChatUsers.bulkCreate(chatUsersData)
            console.log('params geldi');

        } else if (req.body.userIds) {
            console.log('burasi caliti');

            chatData.groupAdmin = req.user.id

            if (Array.isArray(userIds) && userIds.length >= 2) {
                chatData.isGroupChat = true
                chat = await Chat.create(chatData)
                const chatUsersData = userIds.map(UserId => ({ UserId, ChatId: chat.id }))
                chatUsersData.push({ UserId: req.user.id, ChatId: chat.id })
                chatUsers = await ChatUsers.bulkCreate(chatUsersData)
            } else if (userIds.length < 2) {
                throw new Error('Group chat must have at least 2 users.')
            }
        }



        res.status(200).send({
            chat,
            chatUsers
        });
    },

    delete: async (req, res) => {

        const chat = await Chat.findByPk(req.params.id)
        if (!chat) throw new Error('Delivery not found or already deleted.')
        const isDeleted = await chat.destroy()

        res.status(isDeleted ? 202 : 404).send({
            error: !Boolean(isDeleted),
            message: !!isDeleted
                ? `The chat id ${chat.id} has been deleted.`
                : "chat not found or something went wrong.",
            // data: await req.getModelList(chat),
        });
    }
}