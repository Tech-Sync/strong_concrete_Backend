"use strict";
const router = require("express").Router();

const firm = require("../controllers/firm");
const { hasFirmAccess, isAdmin } = require("../middlewares/permissions");

router
  .route("/")
  .get(hasFirmAccess, firm.list)
  .post(hasFirmAccess, firm.create);
router
  .route("/:id")
  .get(hasFirmAccess, firm.read)
  .put(hasFirmAccess, firm.update)
  .delete(isAdmin, firm.delete);

router.route("/restore/:id").all(isAdmin, firm.restore);

module.exports = router;
