const server = require("../../index");

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      // credentials: true // Allow cookies and other credentials to be sent
    }
})
  
module.exports = io;