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
    res.errorStatusCode = 401;
    const { user, isActive } = getUserInfo(req);
    if (user && isActive) next();
    else throw new Error("NoPermission: You must login.");
  },
  isAdmin: (req, res, next) => {
    res.errorStatusCode = 403;
    const { userRole } = getUserInfo(req);

    if (userRole === 5) next();
    else throw new Error("NoPermission: You must be Admin.");
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
  // READ -> Admin, Saler, Accountant
  R_ASA: (req, res, next) => {
    res.errorStatusCode = 403;
    const { userRole } = getUserInfo(req);

    if ([3, 4, 5].includes(userRole)) next();
    else
      throw new Error(
        "NoPermission: You must have sufficient role for this operation."
      );
  },
  // CREATE & UPDATE -> Admin, Saler
  CU_AS: (req, res, next) => {
    res.errorStatusCode = 403;
    const { userRole } = getUserInfo(req);

    if ([4, 5].includes(userRole)) next();
    else
      throw new Error(
        "NoPermission: You must have sufficient role for this operations"
      );
  },
  // CREATE & UPDATE -> Admin, Saler, Accountant
  CU_ASA: (req, res, next) => {
    res.errorStatusCode = 403;
    const { userRole } = getUserInfo(req);

    if ([3, 4, 5].includes(userRole)) next();
    else
      throw new Error(
        "NoPermission: You must have sufficient role for this operation."
      );
  },
  // CREATE & READ & UPDATE -> Admin, Saler
  CRU_AS: (req, res, next) => {
    res.errorStatusCode = 403;
    const { userRole } = getUserInfo(req);

    if ([4, 5].includes(userRole)) next();
    else
      throw new Error(
        "NoPermission: You must have sufficient role for this operation."
      );
  },
  // CREATE & UPDATE -> Admin, Accountant
  CU_AA: (req, res, next) => {
    res.errorStatusCode = 403;
    const { userRole } = getUserInfo(req);

    if ([3, 5].includes(userRole)) next();
    else
      throw new Error(
        "NoPermission: You must have sufficient role for this operation."
      );
  },
  // CREATE & READ & UPDATE -> Admin, Saler, Producer
  CRU_ASP: (req, res, next) => {
    res.errorStatusCode = 403;
    const { userRole } = getUserInfo(req);

    if ([2, 4, 5].includes(userRole)) next();
    else
      throw new Error(
        "NoPermission: You must have sufficient role for this operation."
      );
  },
  // READ & UPDATE-> Admin, Saler, Producer, Driver
  RU_ASPD: (req, res, next) => {
    res.errorStatusCode = 403;
    const { userRole } = getUserInfo(req);

    if ([1, 2, 4, 5].includes(userRole)) next();
    else
      throw new Error(
        "NoPermission: You must have sufficient role for this operation."
      );
  },
};
