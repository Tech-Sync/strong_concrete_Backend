const Message = require('./message');
const { Chat, ReadReceipt } = require('./chat');
const User = require('./user');


// CHAT - MESSAGE
Chat.hasMany(Message, { foreignKey: 'ChatId' });
Message.belongsTo(Chat, { foreignKey: 'ChatId' });

// USER - CHAT
User.hasMany(Chat, { foreignKey: 'groupAdmin' })
Chat.belongsTo(User, { foreignKey: 'groupAdmin' })

// MESSAGE - CHAT
Message.hasOne(Chat, { foreignKey: 'latestMessage' });
Chat.belongsTo(Message, { foreignKey: 'latestMessage' });

// USER - MESSAGE
User.belongsToMany(Message, { through: ReadReceipt });
Message.belongsToMany(User, { through: ReadReceipt });

// USER - MESSAGE
User.hasMany(Message, { foreignKey: 'SenderId' });
Message.belongsTo(User, { foreignKey: 'SenderId' });


module.exports = { Chat, Message };