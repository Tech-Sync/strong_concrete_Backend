"use strict";
const router = require("express").Router();

const firm = require("../controllers/firm");
const permissions = require("../middlewares/permissions");
if (process.env.NODE_ENV !== 'development') {
  router.use(permissions.isLogin);
}

router
  .route("/")
  .get(permissions.R_ASA, firm.list)
  .post(permissions.CU_ASA, firm.create);
router
  .route("/:id")
  .get(permissions.R_ASA, firm.read)
  .put(permissions.CU_AS, firm.update)
  .delete(permissions.isAdmin, firm.delete);

router.route("/restore/:id").get(permissions.isAdmin, firm.restore);

module.exports = router;
