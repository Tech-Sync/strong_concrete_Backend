"use strict";

const { decode } = require("../helpers/encode&decode");
const sendEmail = require("../helpers/sendEmail");
const passwordEncrypt = require("../helpers/passEncrypt");
const User = require("../models/user");

module.exports = {
  list: async (req, res) => {
    /* 
      #swagger.tags = ['User']
      #swagger.summary = 'List All Users'
      #swagger.description = `You can send query with endpoint for search[], sort[], page and limit.
          <ul> Examples:
              <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
              <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
              <li>URL/?<b>page=2&limit=1</b></li>
          </ul>
        `
        #swagger.parameters['showDeleted'] = {
        in: 'query',
        type: 'boolean',
        description:'Send true to show deleted data as well, default value is false'
      }
    */

    const data = await req.getModelList(User);

    res.status(200).send({
      details: await req.getModelListDetails(User),
      data,
    });
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Read User With Id'
        #swagger.description = `<b>-</b> Send access token in header.`
     */
    const data = await User.findByPk(req.params.id);
    if (!data) throw new Error("User not found !");

    res.status(200).send(data);
  },

  update: async (req, res) => {
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Update User With Id'
        #swagger.description = `<b>-</b> Send access token in header.`
        #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>Send the object includes attributes that should be updated.</li>
              <li>Password can not be updated with this API.</li>
            </ul> ',
          required: true,
          schema: {
            firstName:"string",
            lastName:"string",
            nrcNo:"string",
            phoneNo:'number',
            address:'string',
            role:"number",
            email:'string'
          }
        } 
     */

    const allowedUpdates = ['firstName', 'lastName', 'nrcNo', 'phoneNo', 'address', 'role'];

    const updates = Object.keys(req.body);

    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid Update! Check Your Update Field..' });
    }

    try {
      const isUpdated = await User.update(req.body, {
        where: { id: req.params.id },
        individualHooks: true,
      });

      if (!isUpdated[0]) {
        return res.status(404).send({ error: 'User Not Found!' });
      }

      const user = await User.findByPk(req.params.id);
      res.status(202).send({ isUpdated: true, data: user });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  delete: async (req, res) => {
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Delete User With Id'
        #swagger.description = `
          <b>-</b> Send access token in header. <br>
          <b>-</b> This function returns data includes remaning items.
        `
        #swagger.parameters['hardDelete'] = {
          in: 'query',
          type: 'boolean',
          description:'Send true for hard deletion, default value is false which is soft delete.'}
    */

    const hardDelete = req.query.hardDelete === "true";
    if (req.user.role !== 5 && hardDelete)
      throw new Error("You are not authorized for permanent deletetion!");

    const user = await User.findByPk(req.params.id);
    if (!user) throw new Error("User not found or already deleted.");
    user.updaterId = req.user.id;
    const isDeleted = await user.destroy({ force: hardDelete });

    res.status(isDeleted ? 202 : 404).send({
      error: !Boolean(isDeleted),
      message: !!isDeleted
        ? `The user ${user.firstName ? `named ${user.firstName}` : `with ID ${user.id}`
        } has been deleted.`
        : "User not found or something went wrong.",
      data: await req.getModelList(User),
    });
  },

  restore: async (req, res) => {
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Restore Deleted User With Id'
        #swagger.description = `<b>-</b> Send access token in header.`
     */
    const isRestored = await User.restore({ where: { id: req.params.id } });

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "User restored successfuly."
        : "User not found or something went wrong.",
    });
  },
  multipleDelete: async (req, res) => {
    /* 
      #swagger.tags = ['User']
      #swagger.summary = 'Multiple-Delete Users With Id'
      #swagger.description = `
        <b>-</b> Send access token in header. <br>
        <b>-</b> This function returns data includes remaning items.
      `
       #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>You must write the IDs of the users you want to delete into the array.</li>
            </ul> ',
          required: true,
          schema: {
            "ids": [1,2,3]
            
          }
        } 
    */
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error("Invalid or empty IDs array in the request body.");
    }

    let totalDeleted = 0;

    for (const id of ids) {
      const user = await User.findByPk(id);

      if (user) {
        user.updaterId = req.user.id;
        await user.destroy();
        totalDeleted++;
      }
    }

    res.status(totalDeleted ? 202 : 404).send({
      error: !Boolean(totalDeleted),
      message: !!totalDeleted
        ? `The user id's ${ids} has been deleted.`
        : "User not found or something went wrong.",
      data: await req.getModelList(User),
    });
  },

  uptadePassword: async (req, res) => {
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Update User Password'
        #swagger.description = `
          <b>-</b> User should be logged in already.<br>
          <b>-</b> Send access token in header.`
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            password:'aA12345.',
            newPassword:'54321aA?',
            reNewPassword:'54321aA?'
          }
        } 
     */
    const { password, newPassword, reNewPassword } = req.body;
    const { id } = req.user;
    const user = await User.findOne({
      where: { id },
    });

    if (!user) {
      res.errorStatusCode = 404;
      throw new Error("User not found! ");
    }
    if (user.password != passwordEncrypt(password)) {
      throw new Error("Current password didn't match!");
    }

    if (passwordEncrypt(password) === passwordEncrypt(newPassword)) {
      throw new Error("new Password, can't be old  password!");
    }
    if (newPassword != reNewPassword) {
      throw new Error("new Password, reNew Password must be the same");
    }

    user.password = newPassword;
    await user.save();
    res.status(200).send({ message: "Password updated successfully!", user });
  },
  uptadeEmail: async (req, res) => {
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Update User email'
        #swagger.description = `
          <b>-</b> User should be logged in already.<br>
          <b>-</b> Send access token in header.`
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            "currentEmail": "user@gmail.com",
            "newEmail": "user2@gmail.com",
            "reNewEmail": "user2@gmail.com"

          }
        } 
     */
    const { currentEmail, newEmail, reNewEmail } = req.body;
    const { id } = req.user;
    const user = await User.findOne({
      where: { id },
    });

    if (!user) {
      res.errorStatusCode = 404;
      throw new Error("User not found! ");
    }
    if (user.email != currentEmail) {
      throw new Error("Current email didn't match!");
    }

    if (!user.isActive) {
      res.errorStatusCode = 403;
      throw new Error("User is not active! ");
    }

    if (currentEmail === newEmail) {
      throw new Error("New email cannot equal current  email!");
    }
    if (newEmail != reNewEmail) {
      throw new Error("newEmail, reNewEmail  must be the same!");
    }

    user.isVerified = false;
    user.email = newEmail;
    await user.save();
    // userInfo, fileName, Subject
    sendEmail(user, "verify-email", "Email Verification");
    res.status(200).send({
      message: "Check the e-mail sent to your new e-mail address!",
      user,
    });
  },
  forgetPassword: async (req, res) => {
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Forget Password'
        #swagger.description = `
          <b>-</b> Send user email in body. <br>
          <b>-</b> Once user click reset password in the email, he/she will be redirected reset password UI page. <br>
          <b>-</b> Catch <b>uid</b> and <b>emailToken</b> queries to use when reset password API called.`
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
           email: "alidrl26@gmail.com"
          }
        } 
     */

    const email = req.body.email;
    if (!email) throw new Error("Please provide email address.");
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Email verification failed, invalid Email !");
    if (!user.isActive)
      throw new Error(
        "You do not have the appropriate authorizations for this operation."
      );
    // userInfo, fileName, Subject
    sendEmail(user, "reset-password", "Reset Password");

    res.status(200).send({
      message: `Email has been sent to ${email}.`,
    });
  },

  resetPassword: async (req, res) => {
    /* 
        #swagger.tags = ['User']
        #swagger.summary = 'Reset Password'
        #swagger.description = `
          <b>-</b> Send user password in body. <br>
          <b>-</b> Send as a paramas <b>uid</b> and <b>emailToken</b> values.`
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            "password": "any",
            "password2": "any"
          }
        } 
     */

    const { uid, emailToken } = req.params;
    const { password, password2 } = req.body;
    const id = decode(uid);

    if (password != password2) throw new Error("Passwords are not matching !");
    const user = await User.findByPk(id);
    if (!user) throw new Error("User Not Found !");
    if (emailToken != user.emailToken) throw new Error("Token Invalid !");
    user.password = password;

    await user.save();

    res.status(200).send({
      message: "Your password has been changed successfully.",
    });
  },
};
