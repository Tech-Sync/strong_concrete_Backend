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
            }, {
                model: Message,
                as: 'latestMessage',
            },]
        });


        res.status(200).send({
            details: await req.getModelListDetails(Chat),
            userChats,
        });
    },

    messageList: async (req, res) => {

        const { chatId } = req.params
        let messages;

        if (!chatId) throw new CustomError('ChatId is required.', 400)

        messages = await Message.findAll({ where: { chatId } })

        res.status(200).send({
            isError: false,
            messages
        })
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

        if (!(Array.isArray(userIds) && userIds.length >= 2)) throw new CustomError('Users are less than 2 or data type is wrong !', 400)

        groupData.isGroupChat = true
        groupData.chatName = groupData.chatName.toLowerCase()

        chat = await Chat.create(groupData)

        if (!chat) throw new CustomError('Chat not created.', 400)

        const chatUsersData = userIds.map(userId => ({ userId, chatId: chat.id }))

        chatUsersData.push({ userId: currentUserId, chatId: chat.id })

        chatUsers = await ChatUsers.bulkCreate(chatUsersData)

        if (!chatUsers) {
            await chat.destroy()
            throw new CustomError('ChatUsers not created. Group chat deleted! Try Again.', 400)
        }




        res.status(200).send({
            chat,
        });

    },

    groupUpdate: async (req, res) => {

        const { groupId } = req.params

        const group = await Chat.findByPk(groupId)

        if (!group) throw new CustomError('Group not found.', 404)


        const updatedGroup = await group.update(req.body)
        console.log(updatedGroup);

        if (!updatedGroup) throw new CustomError('Group not updated.', 400)


        res.status(200).send({
            isError: false,
            updatedGroup
        })
    },

    // creating message and chat if not exist
    messageCreate: async (req, res) => {

        const { receiverId, ...chatData } = req.body
        let { chatId } = req.body
        const senderId = req.user.id;

        let chat
        let chatUsers;
        let message;

        // if chat id is provided
        if (chatId) {

            chat = await Chat.findOne({ where: { id: chatId } })

            if (!chat) throw new CustomError(`Chat not Found with ID: ${chatId}`, 404)

        } else {

            if (!receiverId) throw new Error('ReceiverId is required.')

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

            // if chat not found creating new chat with receiverId
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