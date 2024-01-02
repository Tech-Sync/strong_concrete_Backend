"use strict";
module.exports = {
  isLogin: (req, res, next) => {
    res.errorStatusCode = 403;
    if (req.user && req.user.isActive) next();
    else throw new Error("NoPermission: You must login.");
  },

  isAdmin: (req, res, next) => {
    return next()
    res.errorStatusCode = 403;
    if (req.user && req.user.isActive && req.user.role === "ADMIN") next();
    else throw new Error("NoPermission: You must login and to be Admin.");
  },

  hasFirmAccess: (req, res, next) => {
    res.errorStatusCode = 403;
    if ((req.user && req.user.isActive) && ["ADMIN", "ACCOUNTANT", "SALER"].includes(req.user.role) )  next();
      else throw new Error("NoPermission: You must login and have sufficient role for firm operations.");
  },
};
