 
import Plan from "../models/Planning.js";
import nodemailer from "nodemailer";
import Sujet from "../models/topic.js"
import { sendNotification } from "../notifyWithMail/mailNotif.js";
import {generateEmailTemplate,COMMON_ATTACHMENTS,} from "../notifyWithMail/notifTemplate.js";
 

const transporter = nodemailer.createTransport({
   service: "gmail",
   port: "587",
   auth: {
     user: "azizhasnaoui000@gmail.com",
     pass: "khnzituyzcsqwclz",
   },
   tls: {
     rejectUnauthorized: false,
   },
 });
 

export const updateSoutenance = async (req, res) => {
  try {
    const { date, horaire, googleMeetLink } = req.body;
    const sujetId = req.params.id;
    console.log(date, horaire, googleMeetLink, sujetId);

    if (!sujetId || !date || !horaire || !googleMeetLink) {
      return res.status(400).json({
        message: "Sujet, date, horaire et lien Google Meet are required",
      });
    }
    const plan = await Plan.findOne({ sujet: sujetId });

    if (!plan) {
      return res.status(404).json({ message: "Can't find planning for this topic" });}

    plan.date = date;
    plan.horaire = horaire;
    plan.googleMeetLink = googleMeetLink;

     
    const updatedPlan = await plan.save();

    const sujet = await Sujet.findById(sujetId).populate("student");
    console.log("topic :", sujet);
    if (!sujet || !sujet.student) {
      return res.status(404).json({ message: "Topic or student not found." });
    }
    const student = sujet.student;
    console.log(student.firstName,student.lastName);
    
   const studentEmailContent = generateEmailTemplate(
     `Soutenance Appointment Updated for ${student.firstName} ${student.lastName}`,
     `<p>Hello <b>${student.firstName} ${student.lastName}</b>,</p>`,
     `
    <p>Your Soutenance appointment has been updated. Here are the details:</p>
    <ul>
      <li><b>Date :</b> ${date}</li>
      <li><b>Time :</b> ${horaire}</li>
      <li><b>Google Meet Link :</b> <a href="${googleMeetLink}">${googleMeetLink}</a></li>
    </ul>
    <p>Please make sure to note down this information.</p>
    <p>Best regards,<br>Internship Management Team</p>
  `
   );

    
   await sendNotification({
     email: student.email,
     subject: "Soutenance appointment",
     htmlContent: studentEmailContent,
     attachments: COMMON_ATTACHMENTS,
   });
     console.log(
       `Emails sent to student (${student.email}) for plan ${plan._id}`
     );

    res.status(200).json({message: "Planning updated successfully ",
      updatedPlan,
    });
  } catch (e) {
    res.status(500).json({error: e.message,message: "Erreur while updating  planning.",
    });
  }
};

