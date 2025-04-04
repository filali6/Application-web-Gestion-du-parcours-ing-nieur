import "../../styles/pfa.css";
import React from "react";
import Swal from "sweetalert2";
import { rejectPFA } from "../../services/pfaService";

const PFAItem = ({ pfa }) => {
  const handleReject = async () => {
    const confirm = await Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Ce PFA sera rejeté définitivement!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, rejeter!",
    });

    if (confirm.isConfirmed) {
      try {
        await rejectPFA(pfa._id);
        Swal.fire("Rejeté!", "Le PFA a été rejeté.", "success");
      } catch (error) {
        Swal.fire("Erreur!", "Une erreur est survenue.", "error");
      }
    }
  };

  return (
    <div className="pfa-item">
      <div className="pfa-info">
        <h3>{pfa.title}</h3>
        <p>{pfa.description}</p>
        <p><strong>Technologies:</strong> {pfa.technologies.join(", ")}</p>
        <p><strong>Encadrant:</strong> {pfa.teacher ? `${pfa.teacher.firstName} ${pfa.teacher.lastName}` : "Non assigné"}</p>
        <p><strong>Étudiant(s):</strong> {pfa.Students.length > 0 ? pfa.Students.map(s => `${s.firstName} ${s.lastName}`).join(", ") : "Pas encore"}</p>
      </div>
      {pfa.status !== "rejected" && (
        <button className="reject-button" onClick={handleReject}>
          Rejeter
        </button>
      )}
    </div>
  );
};

export default PFAItem;
