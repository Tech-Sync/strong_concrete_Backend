"use strict";
// Required packages
const express = require("express");
require("dotenv").config();
const app = express();

// ENV
const BE_BASE_URL = process.env.BE_BASE_URL;
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// ASYNC ERRORS
require("express-async-errors");

// DB CONNECTION
require("./src/configs/dbConnection").dbConnection();

//MIDDLEWARES
app.use(express.json());
app.use(require("./src/middlewares/authentication"));
app.use(require("./src/middlewares/findSearchSortPage"));
// app.use(require("./src/middlewares/logger"));
app.use(require('cors')())



//! Dummy SCRIPT (FOR TESTING) 
// require("./src/helpers/dummyData")()

// HOME
app.all("/", (req, res) => {
  res.send({
    error: false,
    message: "Tech-Sync",
    documents: {
      swagger: "/documents/swagger",
      redoc: "/documents/redoc",
      json: "/documents/json",
    },
  });
});

// Static Files
app.use("/image", express.static("./uploads"));

// ROUTES
app.use(require("./src/routes"));

// ERROR HANDLER
app.use(require("./src/middlewares/errorHandler"));



const server = app.listen(PORT, () => console.log(`Running on http://${HOST}:${PORT}`));

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    // credentials: true // Allow cookies and other credentials to be sent
  }

})

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


module.exports = app