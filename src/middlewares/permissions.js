"use strict";

function getUserInfo(req) {
  let user = req.user;
  let isActive = req.user?.isActive;
  let userId = req.user?.id;
  let userRole = req.user?.role;

  return { user, isActive, userId, userRole };
}

module.exports = {
  isLogin: (req, res, next) => {
    res.errorStatusCode = 403;
    const { user, isActive } = getUserInfo(req);
    if (user && isActive) next();
    else throw new Error("NoPermission: You must login.");
  },

  isAdmin: (req, res, next) => {
    res.errorStatusCode = 403;
    const { userRole } = getUserInfo(req);

    if (userRole === 5) next();
    else throw new Error("NoPermission: You must login and be Admin.");
  },

  isItself: (req, res, next) => {
    res.errorStatusCode = 403;
    const { userRole, userId } = getUserInfo(req);

    if (userRole === 5 || req.params.id == userId)
      next(); // string(9) == number(9) -> true
    else
      throw new Error(
        "NoPermission: You are not authorized for this operation."
      );
  },

  hasFirmAccess: (req, res, next) => {
    res.errorStatusCode = 403;
    if (req.user && req.user.isActive && [5, 3, 4].includes(req.user.role))
      next();
    else
      throw new Error(
        "NoPermission: You must login and have sufficient role for firm operations."
      );
  },
};
