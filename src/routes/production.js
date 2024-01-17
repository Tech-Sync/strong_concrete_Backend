"use strict";
const router = require("express").Router();

const production = require("../controllers/production");

router
  .route("/")
  .get(production.list)
  .post(production.create);
router
  .route("/:id")
  .get(production.read)
  .put(production.update)
  .delete( production.delete);

router.route("/restore/:id").get( production.restore);

module.exports = router;
