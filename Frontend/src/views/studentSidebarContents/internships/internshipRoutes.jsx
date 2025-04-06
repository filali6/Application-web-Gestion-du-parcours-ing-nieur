// internshipRoutes/internshipRoutes.js
import MyInternships from "./myInternships";
import ProjectForm from "./projectForm";
import { Routes, Route } from "react-router-dom";

const InternshipRoutes = () => {
  return (
    <Routes>
      <Route path="/myinternships" element={<MyInternships />} />
      <Route path="/add-topic" element={<ProjectForm />} />
    </Routes>
  );
};

export default InternshipRoutes;
