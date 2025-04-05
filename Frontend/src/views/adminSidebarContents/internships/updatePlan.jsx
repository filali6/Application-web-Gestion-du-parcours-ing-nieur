import React, { useEffect, useState } from "react";
import { fetchTeachers } from "./serviceInternshipAdmin";
import "./Update.css"; // On réutilise le même style que ProjectForm

const UpdatePlanModal = ({ show, toggleShow, onSubmit, plan }) => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const data = await fetchTeachers();
        setTeachers(data);
      } catch (error) {
        console.error("Erreur lors du chargement des enseignants :", error);
      }
    };
    loadTeachers();
  }, []);

  useEffect(() => {
    if (plan?.teachers?._id) {
      setSelectedTeacherId(plan.teachers._id); // Définit l'enseignant actuel
    }
  }, [plan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTeacherId) {
      try {
        await onSubmit(plan._id, selectedTeacherId, plan.sujet._id); // Mise à jour
        toggleShow(); // Ferme le popup après soumission
        setSelectedTeacherId(""); // Réinitialise la sélection de l'enseignant
      } catch (error) {
        alert("Erreur lors de l'affectation de l'enseignant.");
      }
    } else {
      alert("Veuillez sélectionner un enseignant.");
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Bouton de fermeture */}
        <button className="close-btn" onClick={toggleShow}>
          ✖
        </button>

        <h2>Modifier le planning</h2>

        <form onSubmit={handleSubmit} className="project-form">
          {/* Select enseignant */}
          <div className="input-group">
            <label htmlFor="teacher">Sélectionnez un enseignant :</label>
            <select
              id="teacher"
              className="form-input"
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              required
            >
              <option value="">-- Choisir un enseignant --</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Boutons */}
          <div className="button-group">
            <button
              type="button"
              className="cancel-button"
              onClick={toggleShow}
            >
              Annuler
            </button>
            <button type="submit" className="submit-button">
              Affecter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePlanModal;
