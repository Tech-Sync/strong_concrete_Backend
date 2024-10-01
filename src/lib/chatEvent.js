const io = require('../configs/socketConfig');

io.on("connection", (socket) => {
    console.log('---socket connected---' + socket.id);
  
  
    socket.on('joinRoom', (chatId) => {
      socket.join(chatId)
      console.log(`Socket ${socket.id} joined room ${chatId}`);
  
    })
  
    socket.on('leaveRoom', (chatId) => {
      socket.leave(chatId)
      console.log(`Socket ${socket.id} left room ${chatId}`);
    })
  
    socket.on('sendMessage', (message) => {
      console.log(`Message received from ${message.senderId} for chat ${message.chatId}`);
  
      socket.to(message.chatId).emit('receiveMessage', message)
    })
  
    socket.on('typing', ({ chatId }) => {
      console.log('someone is typing ın chat', chatId);
      socket.to(chatId).emit('typing')
    })
  
    socket.on('stopTyping', ({ chatId }) => {
      console.log('someone is stpped in chat', chatId);
  
      socket.to(chatId).emit('stopTyping');
    });
  
  
    socket.on('disconnect', () => {
      console.log('---socket disconnected---' + socket.id);
    });
  
});
  
module.exports = io