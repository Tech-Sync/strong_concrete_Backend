// associations.js
const { Chat, Message, ChatUsers, ReadReceipts } = require('./chat&message');
const User = require('./user');

// CHAT - MESSAGE
Chat.hasMany(Message, { foreignKey: { name: 'chatId', allowNull: false } });
Message.belongsTo(Chat, { foreignKey: { name: 'chatId', allowNull: false } });

// USER - CHAT
User.hasMany(Chat, { foreignKey: 'groupAdmin' });
Chat.belongsTo(User, { foreignKey: 'groupAdmin' });

Chat.belongsToMany(User, { through: ChatUsers, as: 'chatUsers', foreignKey: 'chatId', otherKey: 'userId' });
User.belongsToMany(Chat, { through: ChatUsers, as: 'chatUsers', foreignKey: 'userId', otherKey: 'chatId' });

// MESSAGE - CHAT
Message.hasOne(Chat, { foreignKey: 'latestMessageId', as: 'latestMessage', constraints: false });
Chat.belongsTo(Message, { foreignKey: 'latestMessageId', as: 'latestMessage', constraints: false });

// USER - MESSAGE
User.belongsToMany(Message, { through: ReadReceipts });
Message.belongsToMany(User, { through: ReadReceipts });

// USER - MESSAGE
User.hasMany(Message, { foreignKey: { name: 'senderId', allowNull: false } });
Message.belongsTo(User, { foreignKey: { name: 'senderId', allowNull: false } });

// CHAT - CHAT_USERS
ChatUsers.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false } });
User.hasMany(ChatUsers, { foreignKey: { name: 'userId', allowNull: false } });

module.exports = { Chat, Message, ChatUsers, ReadReceipts, User };