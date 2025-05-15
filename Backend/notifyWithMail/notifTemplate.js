// Attachments for all emails
export const COMMON_ATTACHMENTS = [
  {
    filename: "isammLogo1.png",
    path: "./assets/isammLogo1.png",
    cid: "logo",
  },
];

// Generate Email Template (shared layout)
export const generateEmailTemplate = (title, headerContent, bodyContent) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); background-color: #fefefe;">
    <!-- Header Section -->
    <div style="background: linear-gradient(90deg, #0078FF, #4CAF50); padding: 20px; color: white; text-align: center; font-size: 26px; font-weight: bold; border-bottom: 5px solid rgba(0, 0, 0, 0.1);">
      ${title}
    </div>

    <!-- Logo Section -->
    <div style="padding: 20px; text-align: center; background-color: #f7faff;">
      <img src="cid:logo" alt="ISAMM Logo" style="width: 100px; height: auto; margin-bottom: 20px;">
      ${headerContent}
    </div>

    <!-- Body Section -->
    <div style="padding: 20px 30px; color: #333; background: white; line-height: 1.8;">
      ${bodyContent}
    </div>

    <!-- Footer Section -->
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #888; font-size: 14px;">
      <p style="margin: 5px 0;">Best regards,</p>
      <p style="margin: 0; font-weight: bold;">The ISAMM Administrative Team</p>
    </div>
  </div>
`;

// // Email Template for Update Reminder
// export const updateReminderEmailTemplate = (teacher) => {
//   const subject = "Reminder to Update Your Progress";

//   const headerContent = `
//     <h2 style="font-size: 20px; color: #333; margin-bottom: 5px;">Dear <strong>Professor ${teacher.firstName} ${teacher.lastName}</strong>,</h2>
//     <p style="font-size: 16px; color: #666; margin: 0;">
//       This is a reminder to update your progress for the current semester.
//     </p>
//   `;

//   const bodyContent = `
//     <p style="font-size: 16px;">
//       As a valued professor at our university, we kindly request you to log in to the system and update your teaching progress. Your updates help ensure everything runs smoothly and remains up to date for the benefit of our students.
//     </p>
//     <p style="font-size: 16px;">
//       Please make sure to complete your progress updates at your earliest convenience.
//     </p>
//     <div style="text-align: center; margin: 30px 0;">
//       <a href="/login" target="_blank" style="
//         display: inline-block;
//         padding: 15px 40px;
//         font-size: 16px;
//         color: white;
//         text-decoration: none;
//         background: linear-gradient(90deg, #0078FF, #4CAF50);
//         border-radius: 5px;
//         box-shadow: 0 4px 8px rgba(0, 120, 255, 0.3);
//         font-weight: bold;">
//         Update Now
//       </a>
//     </div>
//   `;
//   return {
//     subject,
//     htmlContent: generateEmailTemplate(subject, headerContent, bodyContent),
//     attachments: COMMON_ATTACHMENTS,
//   };
// };
// Email Template for Late Submission Reminder
export const lateSubmissionEmailTemplate = (student) => {
  const subject = "Reminder: Submit Your Summer Internship Report";

  const headerContent = `
    <h2 style="font-size: 20px; color: #333; margin-bottom: 5px;">Dear <strong>${student.firstName} ${student.lastName}</strong>,</h2>
    <p style="font-size: 16px; color: #666; margin: 0;">
      We hope this email finds you well. This is a friendly reminder regarding your summer internship report submission.
    </p>
  `;

  const bodyContent = `
    <p style="font-size: 16px;">
      As per the guidelines, the deadline for submitting your summer internship report is fast approaching. Please ensure that you submit your report within the remaining time frame to avoid penalties.
    </p>
    <p style="font-size: 16px;">
      Failure to submit your report by the deadline will result in your work being marked as late. If you have already submitted your report, kindly disregard this email.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="/submission-portal" target="_blank" style="
        display: inline-block;
        padding: 15px 40px;
        font-size: 16px;
        color: white;
        text-decoration: none;
        background: linear-gradient(90deg, #FF5733, #C70039);
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(255, 87, 51, 0.3);
        font-weight: bold;">
        Submit Now
      </a>
    </div>
    <p style="font-size: 16px; color: #666; text-align: center;">
      If you have any questions, please reach out to your academic supervisor or contact support.
    </p>
  `;

  return {
    subject,
    htmlContent: generateEmailTemplate(subject, headerContent, bodyContent),
    attachments: COMMON_ATTACHMENTS,
  };
};

// Email Template for Account Creation or Update
export const createAccountEmailTemplate = (action, data) => {
  const { firstName, lastName, cin, password } = data;
  let subject = "";
  let headerContent = "";
  let bodyContent = "";

  switch (action) {
    case "added":
      subject = "Your Account Credentials";
      headerContent = `
        <h2 style="font-size: 22px; color: #333;">Dear <strong>${firstName} ${lastName}</strong>,</h2>
        <p style="font-size: 16px; color: #666; margin: 0;">We are delighted to welcome you to ISAMM.</p>
      `;
      bodyContent = `
        <p style="font-size: 16px;">Your account has been successfully created, and you are now part of our academic family. Below are your login credentials:</p>
        <div style="background: #f7faff; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="font-size: 16px; margin: 0;"><strong>CIN:</strong> ${cin}</p>
          <p style="font-size: 16px; margin: 0;"><strong>Password:</strong> ${password}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="/login" target="_blank" style="
            display: inline-block;
            padding: 15px 40px;
            font-size: 16px;
            color: white;
            text-decoration: none;
            background: linear-gradient(90deg, #0078FF, #4CAF50);
            border-radius: 5px;
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(0, 120, 255, 0.3);">
            Log In Now
          </a>
        </div>
      `;
      break;

    case "updatedC":
      subject = "Updated CIN";
      headerContent = `
        <h2 style="font-size: 22px; color: #333;">Dear <strong>${firstName} ${lastName}</strong>,</h2>
      `;
      bodyContent = `
        <p style="font-size: 16px;">We wanted to let you know that your CIN has been successfully updated.</p>
        <p style="font-size: 16px;">Here is your updated CIN:</p>
        <div style="background: #f7faff; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="font-size: 16px; margin: 0;"><strong>CIN:</strong> ${cin}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="/login" target="_blank" style="
            display: inline-block;
            padding: 15px 40px;
            font-size: 16px;
            color: white;
            text-decoration: none;
            background: linear-gradient(90deg, #0078FF, #4CAF50);
            border-radius: 5px;
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(0, 120, 255, 0.3);">
            Log In Now
          </a>
        </div>
      `;
      break;

    case "updatedP":
      subject = "Updated Account Credentials";
      headerContent = `
        <h2 style="font-size: 22px; color: #333;">Dear <strong>${firstName} ${lastName}</strong>,</h2>
      `;
      bodyContent = `
        <p style="font-size: 16px;">We wanted to let you know that your account credentials have been successfully updated.</p>
        <p style="font-size: 16px;">Here are your updated login credentials:</p>
        <div style="background: #f7faff; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="font-size: 16px; margin: 0;"><strong>CIN:</strong> ${cin}</p>
          <p style="font-size: 16px; margin: 0;"><strong>New Password:</strong> ${password}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="/login" target="_blank" style="
            display: inline-block;
            padding: 15px 40px;
            font-size: 16px;
            color: white;
            text-decoration: none;
            background: linear-gradient(90deg, #0078FF, #4CAF50);
            border-radius: 5px;
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(0, 120, 255, 0.3);">
            Log In Now
          </a>
        </div>
      `;
      break;

    default:
      throw new Error("Unsupported action type.");
  }
  return {
    subject,
    htmlContent: generateEmailTemplate(subject, headerContent, bodyContent),
    attachments: COMMON_ATTACHMENTS,
  };
};

// Email Template for CV Update Notification
export const cvUpdateNotificationTemplate = (student) => {
  const subject = "Reminder to Update Your CV";
  const headerContent = `
    <h2 style="font-size: 20px; color: #333;">Dear <strong>${student.firstName} ${student.lastName}</strong>,</h2>
    <p style="font-size: 16px; color: #666;">We kindly remind you to update your CV on our platform.</p>
  `;
  const bodyContent = `
    <p style="font-size: 16px;">
      To maintain accurate and up-to-date information, please take a moment to log in and update your CV with your latest accomplishments and credentials.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="/cv-update" target="_blank" style="
        display: inline-block;
        padding: 15px 40px;
        font-size: 16px;
        color: white;
        text-decoration: none;
        background: linear-gradient(90deg, #0078FF, #4CAF50);
        border-radius: 5px;
        font-weight: bold;
        box-shadow: 0 4px 8px rgba(0, 120, 255, 0.3);">
        Update CV Now
      </a>
    </div>
  `;
  return {
    subject,
    htmlContent: generateEmailTemplate(subject, headerContent, bodyContent),
    attachments: COMMON_ATTACHMENTS,
  };
};
