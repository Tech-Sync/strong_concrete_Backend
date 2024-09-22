const { sequelize, DataTypes } = require("../configs/dbConnection");
const Chat = require("./chat");

// Message Model
const Message = sequelize.define('Message', {
    // SenderId: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    //     references: { model: 'User', key: 'id' }
    // },
    content: { type: DataTypes.TEXT, allowNull: false },

}, { paranoid: true });



module.exports = Message;