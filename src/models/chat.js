const { sequelize, DataTypes } = require("../configs/dbConnection");
const Message = require("./message");

// Chat Model
const Chat = sequelize.define('Chat', {
    chatName: { type: DataTypes.STRING, allowNull: false },
    isGroupChat: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { paranoid: true });



// ReadReceipt Model
const ReadReceipt = sequelize.define('ReadReceipt', {
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'User', key: 'id' }
    },
    MessageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Message', key: 'id' }
    },
    readAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});





// module.exports = { Chat, Message, ReadReceipt };
module.exports = { Chat, ReadReceipt };
