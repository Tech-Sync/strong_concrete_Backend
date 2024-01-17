"use strict";
module.exports = {
  isLogin: (req, res, next) => {
    res.errorStatusCode = 403;
    if (req.user && req.user.isActive) next();
    else throw new Error("NoPermission: You must login.");
  },

  isAdmin: (req, res, next) => {
    res.errorStatusCode = 403;
    if (req.user && req.user.isActive && req.user.role === 5) next();
    else throw new Error("NoPermission: You must login and to be Admin.");
  },

  hasFirmAccess: (req, res, next) => {
    res.errorStatusCode = 403;
    if ((req.user && req.user.isActive) && [5, 3, 4].includes(req.user.role) )  next();
      else throw new Error("NoPermission: You must login and have sufficient role for firm operations.");
  },
};
