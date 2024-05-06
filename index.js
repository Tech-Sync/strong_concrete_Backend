"use strict";
// Required packages
const express = require("express");
const app = express();

// ENV
require("dotenv").config();
const BASE_URL = process.env.BASE_URL;
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

// ROUTES
app.use(require("./src/routes"));

// ERROR HANDLER
app.use(require("./src/middlewares/errorHandler"));

app.listen(PORT, () => console.log(`Running on http://${HOST}:${PORT}`));

module.exports = app