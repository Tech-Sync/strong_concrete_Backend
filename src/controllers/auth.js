const User = require("../models/user");
const cyrpto = require('node:crypto');
const sendEmail = require("../helpers/sendEmail");
const passwordEncrypt = require("../helpers/passEncrypt");
const setToken = require("../helpers/setToken");
const jwt = require("jsonwebtoken");

module.exports = {
  register: async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user) throw new Error("A user is already exist with this email !");

    req.body.emailToken = cyrpto.randomBytes(64).toString("hex");

    const data = await User.create(req.body);

    // userInfo, fileName, Subject
    sendEmail(data, "verify-email", "Email Verification");

    res.status(201).send(data);
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.errorStatusCode = 401;
      throw new Error("Email and Password are required!");
    }

    const user = await User.findOne({
      where: { email, password: passwordEncrypt(password) },
    });

    if (!user) {
      res.errorStatusCode = 402;
      throw new Error(" Invalid Email or Password!");
    }

    if (!user.isActive) {
      res.errorStatusCode = 402;
      throw new Error(" User is not active!");
    }

    res.send({
      Token: setToken(user),
    });
  },
  refresh: async (req, res) => {
    const refreshToken = req.body?.refresh;

    if (!refreshToken) {
      res.errorStatusCode = 401;
      throw new Error("Please provide refresh token!");
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_KEY,
      async function (err, userData) {
        if (err) {
          res.status(401).send({
            error: true,
            message: err.message,
          });
        }

        const { id, password } = userData;
        if (!id || !password) {
          res.errorStatusCode = 401;
          throw new Error("Please provide ID and password in refresh token!");
        }

        const user = await User.findOne({ where: { id, password } });

        if (!user) {
          res.errorStatusCode = 401;
          throw new Error("Invalid ID or Password!!");
        }

        if (!user.isActive) {
          res.errorStatusCode = 402;
          throw new Error(" User is not active!");
        }

        res.send({
          Token: setToken(user, true),
        });
      }
    );
  },
  logout: (req, res) => {
    res.send({
      message:
        "No need any doing for logout. You must deleted Bearer Token from your browser.",
    });
  },
  verifyEmail: async (req, res) => {
    const emailToken = req.query.emailToken;

    if (!emailToken) throw new Error("Email token not found !");

    const user = await User.findOne({ where: { emailToken } });

    if (!user) throw new Error("Email verification failed, invalid token !");

    user.isVerified = true;

    await user.save();

    res.status(202).send({
      message:'Email verified !',
      user
    });
  },
};
