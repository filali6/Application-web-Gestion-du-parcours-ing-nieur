import cron from "node-cron";
import Teacher from "../models/Teacher.js";
import { sendNotification } from "./mailNotif.js";
import { updateReminderEmailTemplate } from "./notifTemplate.js";

// Run a cron job every 1st day of the month at midnight
const scheduleCronJobs = () => {
  cron.schedule("0 0 1 * *", async () => {
    try {
      console.log("Cron job started: Sending notifications to teachers...");

      const teachers = await Teacher.find();
      for (const teacher of teachers) {
        const { subject, htmlContent, attachments } =
          updateReminderEmailTemplate(teacher);
        await sendNotification({
          email: teacher.email,
          subject,
          htmlContent,
          attachments,
        });
      }

      console.log("Cron job completed: Notifications sent to all teachers.");
    } catch (error) {
      console.error("Error during cron job execution:", error);
    }
  });

  console.log("Cron jobs scheduled successfully.");
};

export default scheduleCronJobs;
