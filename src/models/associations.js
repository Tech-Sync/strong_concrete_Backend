const { Chat, Message, ChatUsers, ReadReceipts } = require('./chat&message');
const User = require('./user');


// CHAT - MESSAGE
Chat.hasMany(Message, { foreignKey: 'ChatId' });
Message.belongsTo(Chat, { foreignKey: 'ChatId' });

// USER - CHAT
User.hasMany(Chat, { foreignKey: 'groupAdmin' });
Chat.belongsTo(User, { foreignKey: 'groupAdmin' });

Chat.belongsToMany(User, { through: ChatUsers, as: 'chatUsers' });
User.belongsToMany(Chat, { through: ChatUsers });

// MESSAGE - CHAT
Message.hasOne(Chat, { foreignKey: 'latestMessage', constraints: false, defaultValue: null });
Chat.belongsTo(Message, { foreignKey: 'latestMessage', constraints: false, defaultValue: null });

// USER - MESSAGE
User.belongsToMany(Message, { through: ReadReceipts });
Message.belongsToMany(User, { through: ReadReceipts });

// USER - MESSAGE
User.hasMany(Message, { foreignKey: 'SenderId' });
Message.belongsTo(User, { foreignKey: 'SenderId' });


module.exports = { Chat, Message, ChatUsers, ReadReceipts, User };
// module.exports = { Chat, Message };