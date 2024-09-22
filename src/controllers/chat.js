// require('../models/chat&message');
const { Chat, Message } = require('../models/associations');
// require('../models/message');
// require('../models/chat');

module.exports = {
    list: async () => {
        res.send({ message: 'Chat list' });
    }
}