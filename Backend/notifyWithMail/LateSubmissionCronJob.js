import cron from "node-cron";
 //nimport Teacher from "../models/Teacher.js";
 import Student from "../models/Student.js";
 import Sujet from "../models/topic.js";
 import Period from "../models/Period.js";
 import { sendNotification } from "./mailNotif.js";
 import { lateSubmissionEmailTemplate } from "./notifTemplate.js";

 const scheduleCronJobs1 = () => {
   cron.schedule("0 0 1 * *", async () => {
     // Vérifier toutes les minutes
     try {
       console.log("Cron job started: checking late students");

       const summerInternshipPeriod = await Period.findOne({
         type: "stageEte",
       });

       // Vérifier si la période est terminée
       if (!summerInternshipPeriod) {
         console.log("Summer internship period not found");
         return;
       }

       const periodEndDate = new Date(summerInternshipPeriod.EndDate);
       const currentTime = new Date();

       // Si la période est déjà terminée, envoyer l'email une seule fois
       if (currentTime > periodEndDate && !summerInternshipPeriod.isEmailSent) {
         console.log(
           "Summer internship deposit period has ended, checking for late students"
         );

         const students = await Student.find();
         const topics = await Sujet.find();
         const submittedStudentIds = topics.map((topic) =>
           topic.student.toString()
         );
         const lateStudents = students.filter(
           (student) => !submittedStudentIds.includes(student._id.toString())
         );

         if (lateStudents.length === 0) {
           console.log("No late students");
           return;
         }

         // Envoi des emails aux étudiants en retard
         for (const student of lateStudents) {
           const { sujet, htmlContent } = lateSubmissionEmailTemplate(student);
           await sendNotification({
             email: student.email,
             sujet,
             htmlContent,
           });
           console.log(`Late submission mail sent to ${student.email}`);
         }

         // Marquer la période comme ayant envoyé l'email
         summerInternshipPeriod.isEmailSent = true;
         await summerInternshipPeriod.save();

         console.log(
           "Cron job finished: late submission mails sent and email flag updated"
         );
       } else {
         console.log(
           "No need to send emails yet, either period is not over or email has already been sent"
         );
       }
     } catch (error) {
       console.error("Error while executing the cron job:", error);
     }
   });

   console.log("Cron jobs scheduled successfully");
 };

 export default scheduleCronJobs1;
