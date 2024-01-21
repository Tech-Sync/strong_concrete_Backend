"use strict";
const router = require("express").Router();

const sale = require("../controllers/sale");
const permissions = require("../middlewares/permissions");
router.use(permissions.isLogin);

router
  .route("/")
  .get(permissions.CRU_AS, sale.list)
  .post(permissions.CRU_AS, sale.create);
router
  .route("/:id")
  .get(permissions.CRU_AS, sale.read)
  .put(permissions.CRU_AS, sale.update)
  .delete(permissions.isAdmin, sale.delete);

router.route("/restore/:id").get(permissions.isAdmin, sale.restore);

module.exports = router;
