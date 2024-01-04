"use strict";
const express = require("express");
const app = express();

// ENV
require("dotenv").config();
const HOST = process.env.HOST;
const PORT = process.env.PORT;

// ASYNC ERRORS
require("express-async-errors");

// DB CONNECTION
require("./src/configs/dbConnection").dbConnection();

// MIDDLEWARES
app.use(express.json());
app.use(require('./src/middlewares/authentication'))

// HOME
app.all("/", (req, res) => {
  console.log(req.query),
  res.send({
    error: false,
    message: "Tech-Sync",
  });
});

// ROUTES
app.use(require("./src/routes"));

//! cary them to related file
require('./src/models/product')
require('./src/models/sale')
require('./src/models/production')
require('./src/models/delivery')

// ERROR HANDLER
app.use(require("./src/middlewares/errorHandler"));

app.listen(PORT, () => console.log(`Running on http://${HOST}:${PORT}`));
