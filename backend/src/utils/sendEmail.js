import nodemailer from "nodemailer";
import env from "../config/env.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text) => {
    await transporter.sendMail({
        from: env.EMAIL_USER,
        to,
        subject,
        text
    });
};

export default sendEmail;