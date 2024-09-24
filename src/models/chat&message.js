const { sequelize, DataTypes } = require("../configs/dbConnection");

// Chat Model
const Chat = sequelize.define('Chat', {
    latestMessageId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    chatName: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    isGroupChat: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { paranoid: true });


// Message Model
const Message = sequelize.define('Message', {
    content: { type: DataTypes.TEXT, allowNull: false },
}, { paranoid: true });

// ChatUsers Model
const ChatUsers = sequelize.define('ChatUsers', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chatId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
}, { paranoid: true })

// ReadReceipts Model
const ReadReceipts = sequelize.define('ReadReceipts', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
}, { paranoid: true })


module.exports = { Chat, Message, ChatUsers, ReadReceipts };
