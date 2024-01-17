"use strict";
const router = require("express").Router();

const firm = require("../controllers/firm");

router
  .route("/")
  .get(firm.list)
  .post(firm.create);
router
  .route("/:id")
  .get(firm.read)
  .put(firm.update)
  .delete( firm.delete);

router.route("/restore/:id").get( firm.restore);

module.exports = router;
