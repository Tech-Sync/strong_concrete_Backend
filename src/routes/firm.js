"use strict";
const router = require("express").Router();

const firm = require("../controllers/firm");
const permissions = require("../middlewares/permissions");

router.use(permissions.isLogin);

router
  .route("/")
  .get(permissions.R_firmAccess, firm.list)
  .post(permissions.CU_firmAccess, firm.create);
router
  .route("/:id")
  .get(permissions.R_firmAccess, firm.read)
  .put(permissions.CU_firmAccess, firm.update)
  .delete(permissions.isAdmin, firm.delete);

router.route("/restore/:id").get(permissions.isAdmin, firm.restore);

module.exports = router;
