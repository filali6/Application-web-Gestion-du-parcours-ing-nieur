import express from "express";
import cors from "cors";
import mongoose from "mongoose";

//IMPORT ROUTES//
import authRoute from "./routes/authRoute.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import subjectRoute from "./routes/skills&subjectsRoutes/subjectRoute.js";
import skillRoute from "./routes/skills&subjectsRoutes/skillRoute.js";
import scheduleCronJobs from "./notifyWithMail/scheduleCronJob.js";
import optionRoute from "./routes/option/optionRoute.js";
import routerPfe from "./routes/pfe/PfeRoute.js";
import adminRoute from "./routes/pfe/adminRoute.js";
import StudentConsultDefenseRoute from "./routes/pfe/StudentConsultDefenseRoute.js"; //pfe
import teacherConsultPlanRoute from "./routes/pfe/teacherConsultPlanRoute.js"; //pfe
import routerPeriod from "./routes/period.js";
import consultRoute from "./routes/Consult/consultRoute.js";
import topicRoute from "./routes/topic.js";
import assignRoute from "./routes/assignRoute.js";
import PfaRoutes from "./routes/PfaRoutes.js";
import scheduleCronJobs1 from "./notifyWithMail/LateSubmissionCronJob.js";
import cvRoutes from "./routes/cv.js";
import saisonRoutes from "./routes/saison.js";
import startCronJob from "./notifyWithMail/cvUpdate.js";
import path from "path";
import { fileURLToPath } from "url";
import dashboardRoutes from './routes/dashboardRoute.js';

// Obtenez le nom de fichier actuel avec import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//SWAGGER//
import swaggerUi from "swagger-ui-express";
import { readFile } from "fs/promises";

const app = express();

//MIDDLEWARES//
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
//READ SWAGGER FILE//
const json = JSON.parse(
  await readFile(new URL("./swagger-output.json", import.meta.url))
);
app.use("/api/doc", swaggerUi.serve, swaggerUi.setup(json));

//MAIN URLs//
app.use("/auth", authRoute);
app.use("/teachers", teacherRoutes);
app.use("/students", studentRoutes);
app.use("/subjects", subjectRoute);
app.use("/skills", skillRoute);
app.use("/options", optionRoute);
app.use("/pfe", routerPfe);
app.use("/pfeAdmin", adminRoute); //pfe
app.use("/pfeStudentConsult", StudentConsultDefenseRoute); //pfe
app.use("/pfeConsult", teacherConsultPlanRoute); //pfe
app.use("/PFA", PfaRoutes);
app.use("/internship", consultRoute);
app.use("/internship/post", topicRoute);
app.use("/internship/planning", assignRoute);
app.use("/period", routerPeriod);
app.use("/", cvRoutes);
app.use("/years", saisonRoutes);
app.use('/dashboard', dashboardRoutes);


//Notifications sent to mail using node cron//
// scheduleCronJobs();
// scheduleCronJobs1();
// startCronJob();
//CONNECT TO DATABASE///
mongoose
  .connect("mongodb://localhost/isamm_project_bd")
  .then(() => {
    console.log("Connected to database isamm_project_bd");
  })
  .catch((err) => {
    console.error("Won't connect to database isamm_project_bd", err);
  });

export default app;
