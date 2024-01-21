"use strict";
const router = require("express").Router();

// Call TODO Controller:
const user = require("../controllers/user");
const permissions = require("../middlewares/permissions");

if (process.env.NODE_ENV !== "development") {
  
  router.use((req, res, next) => {
    const excludedPath = ["/forget-password", "/reset-password"];
    const isExcluded = excludedPath.some((prefix) =>req.path.startsWith(prefix));

    if (isExcluded) next();
    else permissions.isLogin(req, res, next);
  });
}

router.route("/").get(permissions.isAdmin, user.list);
router
  .route("/:id")
  .get(permissions.isItself, user.read)
  .put(permissions.isItself, user.update)
  .delete(permissions.isAdmin, user.delete);
router.route("/update-password").post(user.uptadePassword);
router.route("/restore/:id").get(permissions.isAdmin, user.restore);
router.route("/forget-password").post(user.forgetPassword);
router.route("/reset-password/:uid/:emailToken").post(user.resetPassword);

module.exports = router;
