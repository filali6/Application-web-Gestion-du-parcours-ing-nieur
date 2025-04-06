import React from "react";
import { Routes, Route } from "react-router-dom";

import Consult from "./Consult";
import Affect from "./Affect";
import ManageInternships from "./ManageInternships";

// On garde les routes liées à la gestion des stages dans ce fichier
const ManageRoutes = () => {
  return (
    <Routes>
      <Route path="/manage-internships" element={<ManageInternships />} />

      <Route path="/list-sujets-etudiants" element={<Consult />} />
      <Route path="/affecter-enseignants" element={<Affect />} />
    </Routes>
  );
};

export default ManageRoutes;
