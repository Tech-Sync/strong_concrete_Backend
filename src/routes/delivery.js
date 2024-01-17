"use strict";
const router = require("express").Router();

const delivery = require("../controllers/delivery");

router
  .route("/")
  .get(delivery.list)
  .post(delivery.create);
router
  .route("/:id")
  .get(delivery.read)
  .put(delivery.update)
  .delete( delivery.delete);

router.route("/restore/:id").get( delivery.restore);

module.exports = router;
