import React, { Suspense, Fragment, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Loader from "./components/Loader/Loader";
import AdminLayout from "./layouts/AdminLayout";
import { BASE_URL } from "./config/constant";
import RequireAuth from "./components/Auth/RequireAuth";
import RedirectIfAuth from "./components/Auth/RedirectIfAuth";

// Render nested routes with guards/layouts
export const renderRoutes = (routes = []) => (
  <Suspense fallback={<Loader />}>
    <Routes>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Element = route.element;

        return (
          <Route
            key={i}
            path={route.path}
            element={
              <Guard>
                <Layout>
                  {route.routes ? (
                    renderRoutes(route.routes)
                  ) : (
                    <Element props={true} />
                  )}
                </Layout>
              </Guard>
            }
          />
        );
      })}
    </Routes>
  </Suspense>
);

// Main route definitions
const routes = [
  {
    exact: "true",
    path: "/",
    element: () => (
      <Navigate
        to={localStorage.getItem("token") ? "/dashboard" : "/auth/signin"}
      />
    ),
  },
  {
    exact: "true",
    path: "/auth/signin",
    guard: RedirectIfAuth,
    element: lazy(() => import("./views/auth/signin/SignIn1")),
  },
  {
    path: "*",
    guard: RequireAuth,
    layout: AdminLayout,
    routes: [
      {
        exact: "true",
        path: "/dashboard",
        element: lazy(() => import("./views/dashboard")),
      },
      // 🔽 Admin-specific routes //
      {
        path: "/skills/manage-skills",
        element: lazy(
          () =>
            import("./views/adminSidebarContents/skills_subjects/ManageSkills")
        ),
      },
      {
        path: "/subjects/manage-subjects",
        element: lazy(
          () =>
            import(
              "./views/adminSidebarContents/skills_subjects/ManageSubjects"
            )
        ),
      },
      {
        exact: "true",
        path: "/users/manage-students",
        element: lazy(
          () => import("./views/adminSidebarContents/users/ManageStudents")
        ),
      },
      {
        exact: "true",
        path: "/users/manage-teachers",
        element: lazy(
          () => import("./views/adminSidebarContents/users/ManageTeachers")
        ),
      },
      {
        path: "/pfa/manage-pfa",
        element: lazy(
          () => import("./views/adminSidebarContents/pfa/ManagePFA")
        ),
      },
      {
        path: "/pfa/validate-pfa",
        element: lazy(
          () => import("./views/adminSidebarContents/pfa/ValidatePFA")
        ),
      },
           {
        path: "/pfa/planning",
        element: lazy(
          () => import("./views/adminSidebarContents/pfa/planning/managePlanning")
        ),
      },


        {
        path: "/pfa/myPlannings-pfa",
        element: lazy(
          () => import("./views/teacherSidebarContents/plannings/managePlanning")
        ),
      },
      {
        path: "/pfa/auto-assign",
        element: lazy(
          () => import("./views/adminSidebarContents/pfa/AutoAssignPFA")
        ),
      },

      {
        path: "/pfa/assign-manual",
        element: lazy(
          () => import("./views/adminSidebarContents/pfa/AssignPfaManually")
        ),
      },

      {
        path: "/internships/manage-internships",
        element: lazy(
          () =>
            import("./views/adminSidebarContents/internships/ManageInternships")
        ),
      },
      {
        path: "/internships/topic-status",
        element: lazy(
          () => import("./views/adminSidebarContents/internships/topicStatus")
        ),
      },
      {
        path: "/periode/manage-periode",
        element: lazy(
          () => import("./views/adminSidebarContents/periode/ManagePeriode")
        ),
      },
      {
        exact: "true",
        path: "/academic-year/manage-academic-year",
        element: lazy(
          () =>
            import(
              "./views/adminSidebarContents/academicYear/ManageAcademicYear"
            )
        ),
      },
      // 🔽 Teacher-specific routes //
      {
        path: "/student/students-list",
        element: lazy(
          () => import("./views/teacherSidebarContents/students/studentsList")
        ),
      },
      {
        path: "/subject-skills/subjects-skills-list",
        element: lazy(
          () =>
            import(
              "./views/teacherSidebarContents/subjects-skills/subjectsList"
            )
        ),
      },
      {
        path: "/pfa/pfa-list",
        element: lazy(
          () => import("./views/teacherSidebarContents/pfa/pfaList")
        ),
      },
      {
        path: "/internships/internships-list",
        element: lazy(
          () =>
            import("./views/teacherSidebarContents/Internships/internshipsList")
        ),
      },
      // 🔽 Student-specific routes //
      {
        path: "/subjects/my-subjects-list",
        element: lazy(
          () => import("./views/studentSidebarContents/subjects/mySubjects")
        ),
      },
      {
        path: "/pfa/my-pfa", // 4.1
        element: lazy(() => import("./views/studentSidebarContents/pfa/myPFA")),
      },
      {
        path: "/pfa/choose/:id", //5.1/5.2
        element: lazy(
          () => import("./views/studentSidebarContents/pfa/ChoosePFA")
        ),
      },
      {
        path: "/internships/my-internships",
        element: lazy(
          () =>
            import("./views/studentSidebarContents/internships/myInternships")
        ),
      }, // NOTEZ LA VIRGULE ICI
      // Ajoutez la nouvelle route ici
      {
        path: "/internships/details/",
        element: lazy(
          () =>
            import("./views/studentSidebarContents/internships/topicDetails")
        ),
      },
      {
        path: "/student/student-profile",
        element: lazy(
          () => import("./views/studentSidebarContents/profile/studentProfile")
        ),
      },
      {
        path: "/student/student-cv",
        element: lazy(
          () => import("./views/studentSidebarContents/cv/studentCV")
        ),
      },

      {
        path: "/student/planning-pfa",
        element: lazy(
          () => import("./views/studentSidebarContents/pfaPlannings/ManagePFA")
        ),
      },
      
      {
        path: "*",
        exact: "true",
        element: () => <Navigate to={BASE_URL} />,
      },
      {
        path: "/students/:studentId/cv",
        element: lazy(() => import("./components/StudentCV/StudentCV")),
      },
    ],
  },
];

export default routes;
