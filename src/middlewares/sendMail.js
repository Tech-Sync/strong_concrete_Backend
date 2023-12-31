const nodemailer = require('nodemailer');


function sendEmail(user) {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_APP_PASS,
    },
  });

  const mailOptions = { 
    from: { name: "Strong Concrete", address: process.env.EMAIL_ADDRESS },
    to: user.email,
    subject: "Email Verification",
    html: `<p>Hello 👋🏻${user.firstName}, verify your email by clicking this button </p>
    <button>
    <a href ='http://127.0.0.1:8000/users/verify-email?emailToken=${user.emailToken}'> Verify Your Email</a>
    </button>
    ` 
  };
  
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      throw new Error("Email did not go trough!");
    } else {
      console.log("Email sent to " + user.email);
    }
  });
}

module.exports = sendEmail;
