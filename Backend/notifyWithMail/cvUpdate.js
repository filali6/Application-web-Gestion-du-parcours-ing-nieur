import cron from "node-cron";
import { cvUpdateNotificationTemplate } from "./notifTemplate.js";
import { sendNotification } from "./mailNotif.js";
import Student from "../models/Student.js";

// Cron job to send CV update notifications
const startCronJob = () => {
  cron.schedule("9 * * * *", async () => {
    // Adjusted to run hourly
    try {
      console.log("Cron Job Started: Sending CV Update Notifications...");

      // Fetch students with "diplômé" status who haven't received an email
      const graduatedStudents = await Student.find({
        status: "diplomé",
      });

      if (graduatedStudents.length === 0) {
        console.log("No graduated students needing CV update.");
        return;
      }

      console.log("Graduated students:", graduatedStudents);

      for (const student of graduatedStudents) {
        try {
          if (!student.email) {
            continue;
          }
          const emailTemplate = cvUpdateNotificationTemplate(student); // Generate email template
          await sendNotification({
            email: student.email,
            subject: emailTemplate.subject,
            htmlContent: emailTemplate.htmlContent,
            attachments: emailTemplate.attachments,
          });
          student.emailSent = true;
          await student.save(); // Save the emailSent flag to the database
        } catch (error) {}
      }

      console.log("Cron Job Completed: All emails sent.");
    } catch (error) {
      console.error("Error during Cron Job:", error);
    }
  });
};

export default startCronJob;
