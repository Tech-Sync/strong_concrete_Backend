"use strict";
const router = require("express").Router();

const material = require("../controllers/material");

router.route("/").get(material.list).post(material.create);
router
  .route("/:id")
  .get(material.read)
  .put(material.update)
  .delete(material.delete);

router.route("/restore/:id").all(material.restore);

module.exports = router;
