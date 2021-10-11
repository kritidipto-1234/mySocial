const nodemailer = require("nodemailer");

async function sendEmail(options) {
    const transporter = nodemailer.createTransport({
        // host: process.env.EMAIL_HOST,
        // port: process.env.EMAIL_PORT,
        service: "SendGrid",
        auth: {
            user: process.env.SENDGRID_USERNAME,
            pass: process.env.SENDGRID_PASSWORD,
        },
        // logger: true,
        // debug: true,
    });

    const mailOptions = {
        from: "kritidiptodgp.ghosh@gmail.com",
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
