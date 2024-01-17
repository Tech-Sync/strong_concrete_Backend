"use strict";
const router = require("express").Router();

const vehicle = require("../controllers/vehicle");

router
  .route("/")
  .get(vehicle.list)
  .post(vehicle.create);
router
  .route("/:id")
  .get(vehicle.read)
  .put(vehicle.update)
  .delete( vehicle.delete);

router.route("/restore/:id").get( vehicle.restore);

module.exports = router;
