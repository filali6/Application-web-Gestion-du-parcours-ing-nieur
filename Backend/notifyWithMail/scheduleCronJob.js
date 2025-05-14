import cron from "node-cron";
import Subject from "../models/Subject&Skill/Subject.js";
import { sendNotification } from "./mailNotif.js";
import { generateEmailTemplate, COMMON_ATTACHMENTS } from "./notifTemplate.js";

const scheduleCronJobs = () => {
  cron.schedule("0 0 1 * *", async () => {
    try {
      console.log("Cron started: Progress reminder emails to teachers...");

      const subjects = await Subject.find({
        isArchived: false,
        isPublished: true,
        assignedTeacherHasAdvanced: false,
        assignedTeacher: { $ne: null },
      }).populate("assignedTeacher", "email firstName lastName");

      if (!subjects.length) {
        console.log("No pending advancements. No teacher reminders needed.");
        return;
      }

      const teacherMap = new Map();

      for (const subject of subjects) {
        const teacher = subject.assignedTeacher;
        if (!teacher) continue;

        const teacherId = teacher._id.toString();
        if (!teacherMap.has(teacherId)) {
          teacherMap.set(teacherId, {
            teacher,
            subjects: [],
          });
        }
        teacherMap.get(teacherId).subjects.push(subject);
      }

      const notifications = [];

      for (const { teacher, subjects } of teacherMap.values()) {
        const subjectCards = subjects
          .map(
            (s) => `
              <div style="
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 10px;
                padding: 15px 20px;
                margin-bottom: 20px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
              ">
                <h3 style="color: #0078FF; margin-bottom: 10px;">📘 ${s.title}</h3>
                <p style="margin: 0;">This subject needs a progress update.</p>
              </div>`
          )
          .join("");

        const htmlContent = generateEmailTemplate(
          "Progress Reminder",
          `<h2 style="color: #333;">Dear ${teacher.firstName} ${teacher.lastName},</h2>
           <p>Please update the progress for the following subjects assigned to you:</p>`,
          `${subjectCards}
           <div style="text-align: center; margin-top: 30px;">
             <a href="https://your-system-link.com/dashboard" target="_blank" style="
               display: inline-block;
               padding: 15px 40px;
               font-size: 16px;
               color: white;
               text-decoration: none;
               background: linear-gradient(90deg, #0078FF, #4CAF50);
               border-radius: 5px;
               box-shadow: 0 4px 8px rgba(0, 120, 255, 0.3);
               font-weight: bold;">
               Update Progress
             </a>
           </div>`
        );

        notifications.push(
          sendNotification({
            email: teacher.email,
            subject: "📢 Reminder: Update Subject Progress",
            htmlContent,
            attachments: COMMON_ATTACHMENTS,
          })
        );
      }

      await Promise.all(notifications);
      console.log("Reminder emails sent to teachers who haven't updated progress.");
    } catch (error) {
      console.error("Cron job failed:", error);
    }
  });

  // console.log("Cron job scheduled for teacher progress reminders.");
};

export default scheduleCronJobs;
