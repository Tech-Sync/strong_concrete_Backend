"use strict";
const router = require("express").Router();

const vehicle = require("../controllers/vehicle");
const permissions = require("../middlewares/permissions");
if (process.env.NODE_ENV !== 'development') {
  router.use(permissions.isLogin);
}

router
  .route("/")
  .get(permissions.RU_ASPD,vehicle.list)
  .post(permissions.CU_AS, vehicle.create);
router
  .route("/:id")
  .get(permissions.RU_ASPD,vehicle.read)
  .put(permissions.RU_ASPD,vehicle.update)
  .delete( permissions.isAdmin,vehicle.delete);

router.route("/restore/:id").get(permissions.isAdmin, vehicle.restore);
router.route("/multiple-delete").post(permissions.isAdmin, vehicle.multipleDelete);
module.exports = router;
