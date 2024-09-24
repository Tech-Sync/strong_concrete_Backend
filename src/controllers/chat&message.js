const CustomError = require('../helpers/customError');
const { Chat, Message, ChatUsers, ReadReceipts, User } = require('../models/associations');
const sequelize = require('sequelize');
const { Op, Sequelize } = sequelize;

module.exports = {
    chatList: async (req, res) => {
        const currentUser = req.user;

        const userChatIds = await ChatUsers.findAll({ where: { userId: currentUser.id }, attributes: ['chatId'] });

        const chatIds = userChatIds.map(chatUser => chatUser.chatId);

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
    chatDelete: async (req, res) => {

        const chat = await Chat.findByPk(req.params.chatId)
        if (!chat) throw new Error('Delivery not found or already deleted.')
        const isDeleted = await chat.destroy()

        res.status(isDeleted ? 202 : 404).send({
            error: !Boolean(isDeleted),
            message: !!isDeleted
                ? `The chat id ${chat.id} has been deleted.`
                : "chat not found or something went wrong.",
            // data: await req.getModelList(chat),
        });
    },

    groupCreate: async (req, res) => {
        const { userIds, ...groupData } = req.body
        const currentUserId = req.user.id;

        let chat;
        let chatUsers;

        groupData.groupAdmin = currentUserId

        if (Array.isArray(userIds) && userIds.length >= 2) {
            groupData.isGroupChat = true

            chat = await Chat.create(groupData)

            const chatUsersData = userIds.map(userId => ({ userId, chatId: chat.id }))

            chatUsersData.push({ userId: currentUserId, chatId: chat.id })

            chatUsers = await ChatUsers.bulkCreate(chatUsersData)

        } else if (userIds.length < 2) {
            throw new Error('Group chat must have at least 2 users.')
        }

        res.status(200).send({
            chat,
        });

    },

    messageCreate: async (req, res) => {

        const { receiverId, ...chatData } = req.body
        let { chatId } = req.body
        const senderId = req.user.id;

        let chat
        let chatUsers;
        let message;

        if (chatId) {
            if (!receiverId) throw new Error('ReceiverId is required.')

            chat = await Chat.findOne({ where: { id: chatId } })

            if (!chat) throw new CustomError(`Chat not Found with ID: ${chatId}`, 404)

        } else {

            chat = await Chat.findOne({
                where: { isGroupChat: false },
                include: [
                    {
                        model: User,
                        as: 'chatUsers',
                        through: { attributes: [] },
                        where: {
                            id: {
                                [Op.in]: [senderId, receiverId]
                            }
                        }
                    }
                ],
                group: ['Chat.id'],
                having: Sequelize.literal(
                    `(SELECT COUNT(DISTINCT "ChatUsers"."userId") 
                     FROM "ChatUsers" 
                     WHERE "ChatUsers"."chatId" = "Chat"."id" 
                     AND "ChatUsers"."userId" IN (${senderId}, ${receiverId})) = 2`
                ),
            });


            if (!chat) {
                chat = await Chat.create(chatData)

                const chatUsersData = [{ userId: receiverId, chatId: chat.id }, { userId: req.user.id, chatId: chat.id }]

                if (!chat) throw new CustomError('Chat not created.', 400)

                chatUsers = await ChatUsers.bulkCreate(chatUsersData)

            }

        }


        chatId = chat.id

        message = await Message.create({ ...chatData, senderId, chatId: chat.id })

        if (!message) throw new CustomError('Message not created.', 400)

        chat = await Chat.update({ latestMessageId: message.id }, { where: { id: chat.id } })

        res.status(200).send({
            chat: await Chat.findByPk(chatId),
            message,
            chatUsers
        });
    },


}