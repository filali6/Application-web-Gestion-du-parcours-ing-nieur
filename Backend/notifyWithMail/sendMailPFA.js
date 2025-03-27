
import nodemailer from "nodemailer";
import {generateEmailTemplate, COMMON_ATTACHMENTS} from "./notifTemplate.js"

export const sendEmail = async (email, subject, headerContent, bodyContent) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "azizhasnaoui000@gmail.com",
        pass: "sexgkvgjqzzacnbl",
    },
  });

  try {
    const htmlContent = generateEmailTemplate(subject, headerContent, bodyContent);
    await transporter.sendMail({
      from: "azizhasnaoui000@gmail.com",
      to: email,
      subject,
      html: htmlContent,
      attachments: COMMON_ATTACHMENTS,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};