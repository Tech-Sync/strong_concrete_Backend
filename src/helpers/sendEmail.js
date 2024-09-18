const transporter = require("../configs/emailConnection");
const fs = require("fs");
const path = require("path");
const { encode } = require("../helpers/encode&decode");

function sendEmail(user, fileName, subject) {

  const templatePath = path.join(__dirname, `../templates/${fileName}.html`);
  const htmlTemplate = fs.readFileSync(templatePath, "utf8");
  const mailOptions = {
    from: { name: "Strong Concrete", address: process.env.EMAIL_ADDRESS },
    to: user.email,
    subject,
    html: htmlTemplate
      .replace("user.emailToken", user.emailToken)
      .replace("companyMailAddress", process.env.EMAIL_ADDRESS)
      .replace("frontend_url", process.env.FE_BASE_URL)
      .replace("encoded", encode(user.id)),
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error.nessage);
      console.log("Email did not go trough!");
      // throw new Error("Email did not go trough!");
    } else {
      console.log("Email sent to " + user.email);
    }
  });
}

module.exports = sendEmail;
