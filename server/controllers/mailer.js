import nodemailer from "nodemailer";
import mailgen from "mailgen";
import env from "../config.js";

// SMTP configuration
const nodeconfig = {
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: env.EMAIL,
    pass: env.PASSWORD,
  },
};

const transporter = nodemailer.createTransport(nodeconfig);

const mailgenerator = new mailgen({
  theme: "default",
  product: {
    name: "Mailgen",
    link: "https://mailgen.js",
  },
});

// Default export for registerMail
const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;

  // Body of the email
  const email = {
    body: {
      name: username,
      intro:
        text ||
        "Welcome to SR Technologies! We're very excited to have you on board.",
      outro:
        "Need help or have questions? Just reply to this email; we'd love to help.",
    },
  };

  const emailBody = mailgenerator.generate(email);
  const message = {
    from: env.EMAIL,
    to: userEmail,
    subject: subject || "Signup Successful",
    html: emailBody,
  };

  try {
    // Send mail using async/await
    await transporter.sendMail(message);
    return res.status(200).send({ msg: "You should receive an email from us." });
  } catch (error) {
    console.error("Error sending email:", error); // Log error for debugging
    return res.status(500).send({ error: "Failed to send email. Please try again later." });
  }
};

export default registerMail; // Ensure this line is present to export the function
