"use strict";
const router = require("express").Router();

const delivery = require("../controllers/delivery");
const permissions = require("../middlewares/permissions");
router.use(permissions.isLogin);

router
  .route("/")
  .get(permissions.RU_ASPD, delivery.list)
  .post(permissions.CRU_ASP, delivery.create);
router
  .route("/:id")
  .get(permissions.RU_ASPD, delivery.read)
  .put(permissions.RU_ASPD, delivery.update)
  .delete(permissions.isAdmin, delivery.delete);

router.route("/restore/:id").get(permissions.isAdmin, delivery.restore);

module.exports = router;
