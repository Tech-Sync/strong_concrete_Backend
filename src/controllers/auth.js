const User = require("../models/user");
const cyrpto = require("node:crypto");
const sendEmail = require("../helpers/sendEmail");
const passwordEncrypt = require("../helpers/passEncrypt");
const setToken = require("../helpers/setToken");
const jwt = require("jsonwebtoken");

module.exports = {
  register: async (req, res) => {
    /* 
        #swagger.tags = ['Authentication']
        #swagger.summary = 'User Register'
        #swagger.description = `
        <b>-</b> Only admin can register a user from admin panel. <br>
        <b>-</b> Once register successful, an email will be sent to user email address.`
        #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>The Email should be a valid email, otherwise can not do any function.</li>
              <li>Password should includes least capital and lower case, number, special char, and min 8 lenght.</li>
            </ul> ',
          required: true,
          schema: {
            firstName:'test',
            lastName:'test',
            nrcNo:'11111111',
            phoneNo:'+26011111',
            address:'ibex',
            role:4,
            email:'test@gmail.com',
            password:'aA123456.?',
          }
        } 
    */
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
    /* 
        #swagger.tags = ['Authentication']
        #swagger.summary = 'User Login'
        #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>The Email should be a verified, otherwise user can not login.</li>
            </ul> ', 
          required: true,
          schema: {
            email:'test@gmail.com',
            password:'aA123456.?',
          }
        } 
    */

    const { email, password } = req.body;

    if (!email || !password) {
      res.errorStatusCode = 400;
      throw new Error("Email and Password are required!");
    }

    const user = await User.findOne({
      where: { email, password: passwordEncrypt(password) },
    });

    if (!user) {
      res.errorStatusCode = 401;
      throw new Error(" Invalid Email or Password!");
    }

    if (!user.isVerified) {
      res.errorStatusCode = 401;
      throw new Error(" Please verify your email address !");
    }

    if (!user.isActive) {
      res.errorStatusCode = 403;
      throw new Error(" User is not active!");
    }

    res.send(setToken(user));
  },
  refresh: async (req, res) => {
    /* 
        #swagger.tags = ['Authentication']
        #swagger.summary = 'JWT Refresh Token'
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            refresh: "---refresh token----",
          }
        } 
    */
    const refreshToken = req.body?.refresh;

    if (!refreshToken) {
      res.errorStatusCode = 400;
      throw new Error("Please provide refresh token!");
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_KEY,
      async function (err, userData) {
        if (err) {
          res.status(400).send({
            error: true,
            message: err.message,
          });
        }

        const { id, password } = userData;
        if (!id || !password) {
          res.errorStatusCode = 400;
          throw new Error("Please provide ID and password in refresh token!");
        }

        const user = await User.findOne({ where: { id, password } });

        if (!user) {
          res.errorStatusCode = 401;
          throw new Error("Invalid ID or Password!!");
        }

        if (!user.isActive) {
          res.errorStatusCode = 403;
          throw new Error(" User is not active!");
        }

        res.send(setToken(user, true));
      }
    );
  },
  logout: (req, res) => {
    /* 
        #swagger.tags = ['Authentication']
        #swagger.summary = 'User Logout'
        #swagger.description = `<b>-</b> No need any doing for logout. You must use SignOut function from next-auth.`
    */
    res.send({
      message:
        "No need any doing for logout. You must deleted Bearer Token from your browser.",
    });
  },
  verifyEmail: async (req, res) => {
    /* 
        #swagger.tags = ['Authentication']
        #swagger.summary = 'Verify Email'
        #swagger.autoQuery = true 
        #swagger.description = `
        <b>-</b> When user verify email address, He/She will be directed email verify UI page with emailToken in query. <br>
        <b>-</b> Catch the emailToken and send in query by call this API.`
        #swagger.parameters['emailToken'] = {
            in: 'query',
            type: 'string',
            schema: '--emailToken--'
          }

    */
    const emailToken = req.query.emailToken;

    if (!emailToken) throw new Error("Email token not found !");

    const user = await User.findOne({ where: { emailToken } });

    if (!user) throw new Error("Email verification failed, invalid token !");

    user.isVerified = true;

    await user.save();

    res.status(202).send({
      message: "Email verified !",
      user,
    });
  },
};
