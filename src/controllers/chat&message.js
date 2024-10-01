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
            }, {
                model: User,
                as: 'groupAdmin',
                attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic', 'phoneNo', 'role', 'email'],
            }]
        });


        res.status(200).send({
            isError: false,
            userChats,
        });
    },

    readChat: async (req, res) => {

        const { chatId } = req.params

        if (!chatId) throw new CustomError('ChatId is required.', 400)

        const chat = await Chat.findOne({
            where: { id: chatId },
            include: [{
                model: User,
                as: 'chatUsers',
                through: { attributes: [] },
                attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic', 'phoneNo', 'role', 'email'],
            }, {
                model: Message,
                as: 'latestMessage',
            }, {
                model: User,
                as: 'groupAdmin',
                attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic', 'phoneNo', 'role', 'email'],
            }]
        });

        if (!chat) throw new CustomError('Chat not found.', 404)

        const messages = await Message.findAll({ where: { chatId } })

        res.status(200).send({
            isError: false,
            selectedChat: chat,
            messages
        });
    },

    messageList: async (req, res) => {

        const { chatId } = req.params
        let messages;

        if (!chatId) throw new CustomError('ChatId is required.', 400)

        if (chatId !== 'null') messages = await Message.findAll({ where: { chatId } })

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
        let { userIds, ...groupData } = req.body
        const currentUserId = req.user.id;

        if (typeof userIds === 'string') {
            try {
                userIds = JSON.parse(userIds);
            } catch (error) {
                throw new CustomError('Invalid userIds format', 400);
            }
        }

        let chat;
        let chatUsers;

        groupData.groupAdminId = currentUserId

        if (!(Array.isArray(userIds) && userIds.length >= 2)) throw new CustomError('Users are less than 2 or data type is wrong !', 400)

        groupData.isGroupChat = true
        groupData.chatName = groupData.chatName.toLowerCase()

        const allUserIds = [...userIds, currentUserId];

        group = await Chat.findOne({
            where: { isGroupChat: true },
            include: [
                {
                    model: User,
                    as: 'chatUsers',
                    through: { attributes: [] },
                    where: {
                        id: {
                            [Op.in]: allUserIds
                        }
                    }
                }
            ],
            group: ['Chat.id'],
            having: Sequelize.literal(
                `(SELECT COUNT(DISTINCT "ChatUsers"."userId") 
                 FROM "ChatUsers" 
                 WHERE "ChatUsers"."chatId" = "Chat"."id" 
                 AND "ChatUsers"."userId" IN (${allUserIds.join(', ')})) = ${allUserIds.length}`
            ),
        });


        if (group) throw new CustomError('Group already exist with these users. Group name: ' + group.chatName, 400)

        if (req.file) {
            console.log("req file --", req.file);
            groupData.chatPicture = req.file.filename;
        }
        group = await Chat.create(groupData);

        if (!group) throw new CustomError('Chat not created.', 400)

        const chatUsersData = userIds.map(userId => ({ userId, chatId: group.id }))

        chatUsersData.push({ userId: currentUserId, chatId: group.id })

        chatUsers = await ChatUsers.bulkCreate(chatUsersData)

        if (!chatUsers) {
            await group.destroy()
            throw new CustomError('ChatUsers not created. Group group deleted! Try Again.', 400)
        }

        group = await Chat.findOne({
            where: { id: group.id },
            include: [{
                model: User,
                as: 'chatUsers',
                through: { attributes: [] },
                attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic', 'phoneNo', 'role', 'email'],
            }, {
                model: Message,
                as: 'latestMessage',
            }, {
                model: User,
                as: 'groupAdmin',
                attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic', 'phoneNo', 'role', 'email'],
            }]
        });

        const userChatIds = await ChatUsers.findAll({ where: { userId: currentUserId }, attributes: ['chatId'] });

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
            }, {
                model: User,
                as: 'groupAdmin',
                attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic', 'phoneNo', 'role', 'email'],
            }]
        });

        res.status(200).send({
            isError: false,
            group,
            userChats
        });

    },

    groupUpdate: async (req, res) => {

        const { groupId } = req.params


        const group = await Chat.findByPk(groupId)

        if (!group) throw new CustomError('Group not found.', 404)

        if (group.groupAdminId !== req.user.id) throw new CustomError('You are not authorized to update this group.', 403)

        if (req.body.chatName) {
            req.body.chatName = req.body.chatName.toLowerCase()
            const chatNameExist = await Chat.findOne({ where: { chatName: req.body.chatName, isGroupChat: true, groupAdminId: req.user.id } })
            if (chatNameExist) throw new CustomError('ChatName already exist. Try another one.', 400)
        }

        if (req.body.groupAdminId || req.body.isGroupChat) {
            delete req.body.groupAdminId; delete req.body.isGroupChat;
        }

        if (req.body.userIds) {
            const existingChatUsers = await ChatUsers.findAll({ where: { chatId: groupId } });
            const existingUserIds = existingChatUsers.map(chatUser => chatUser.userId);
            const userIdsToRemove = existingUserIds.filter(userId => req.body.userIds.includes(userId));

            if (userIdsToRemove.includes(group.groupAdminId)) throw new CustomError('You can not remove yourself from group.', 400)

            const userIdsToAdd = req.body.userIds.filter(userId => !existingUserIds.includes(userId));

            if (userIdsToRemove.length > 0) {
                await ChatUsers.destroy({ where: { chatId: groupId, userId: userIdsToRemove } });
            }

            if (userIdsToAdd.length > 0) {
                const newChatUsersData = userIdsToAdd.map(userId => ({ userId, chatId: groupId }));
                await ChatUsers.bulkCreate(newChatUsersData);
            }
        }

        const updatedGroup = await group.update(req.body)

        if (!updatedGroup) throw new CustomError('Group not updated.', 400)

        res.status(200).send({
            isError: false,
            updatedGroup
        })
    },

    // creating message and chat if not exist
    MessageChatCreate: async (req, res) => {

        const { receiverId, content } = req.body
        let { chatId } = req.params
        const senderId = req.user.id;

        let chat
        let chatUsers;
        let message;

        // if chat id is provided
        if (chatId && chatId !== 'null') {

            chat = await Chat.findOne({
                where: { id: chatId },
                include: [{
                    model: User,
                    as: 'chatUsers',
                    through: { attributes: [] },
                    attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic', 'phoneNo', 'role', 'email'],
                }, {
                    model: Message,
                    as: 'latestMessage',
                }, {
                    model: User,
                    as: 'groupAdmin',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic', 'phoneNo', 'role', 'email'],
                }]
            });

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
                        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic', 'phoneNo', 'role', 'email'],
                        where: {
                            id: {
                                [Op.in]: [senderId, receiverId]
                            }
                        }
                    },
                    {
                        model: User,
                        as: 'groupAdmin',
                        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic', 'phoneNo', 'role', 'email'],
                    }, {
                        model: Message,
                        as: 'latestMessage',
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
                newChat = await Chat.create()

                const chatUsersData = [{ userId: receiverId, chatId: newChat.id }, { userId: req.user.id, chatId: newChat.id }]

                if (!newChat) throw new CustomError('Chat not created.', 400)

                chat = await Chat.findOne({
                    where: { id: chat.id },
                    include: [{
                        model: User,
                        as: 'chatUsers',
                        through: { attributes: [] },
                        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic', 'phoneNo', 'role', 'email'],
                    }, {
                        model: Message,
                        as: 'latestMessage',
                    }, {
                        model: User,
                        as: 'groupAdmin',
                        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePic', 'phoneNo', 'role', 'email'],
                    }]
                });

                chatUsers = await ChatUsers.bulkCreate(chatUsersData)

                if (!chatUsers) {
                    await chat.destroy()
                    throw new CustomError('ChatUsers not created. Chat deleted! Try Again.', 400)
                }
            }
        }

        chatId = chat.id

        // this is creating chat without chat
        if (content) {
            message = await Message.create({ content, senderId, chatId: chat.id })
            if (!message) throw new CustomError('Message not created.', 400)
            await Chat.update({ latestMessageId: message.id }, { where: { id: chat.id } })
        }

        res.status(200).send({
            isError: false,
            message,
            chat,
        });
    },


}