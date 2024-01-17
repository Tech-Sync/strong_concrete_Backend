"use strict";
// Required packages
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

//MIDDLEWARES
app.use(express.json());
app.use(require("./src/middlewares/authentication"));
app.use(require("./src/middlewares/findSearchSortPage"));
app.use(require("./src/middlewares/logging"));
// Swagger-UI
const swaggerUi = require("swagger-ui-express");
const swaggerJson = require("./swagger.json");
app.use(
  "/docs/swagger",
  swaggerUi.serve,
  swaggerUi.setup(swaggerJson, {
    swaggerOptions: { persistAuthorization: true },
  })
);
const redoc = require("redoc-express");
app.use("/docs/json", (req, res) => {
  res.sendFile("swagger.json", { root: "." })});
app.use(
  "/docs/redoc",
  redoc({
    specUrl: "/docs/json",
    title: "API Docs",
  })
);

// HOME
app.all("/", (req, res) => {
  console.log(req.query),
    res.send({
      error: false,
      message: "Tech-Sync",
      docs: {
        json: "/docs/json",
        swagger: "/docs/swagger",
        redoc: "/docs/redoc",
      },
    });
});

// ROUTES
app.use(require("./src/routes"));

// ERROR HANDLER
app.use(require("./src/middlewares/errorHandler"));

app.listen(PORT, () => console.log(`Running on http://${HOST}:${PORT}`));
