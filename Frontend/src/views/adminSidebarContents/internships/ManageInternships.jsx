import React, { useState } from "react";
import "./ManageInternships.css";
import Consult from "./Consult";
import Affect from "./Affect";

const OptionCard = ({ title, description, onClick }) => {
  return (
    <div className="option-card" onClick={onClick}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
};

const ManageInternships = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div className="page-container">
      <h3>Gérer les Stages</h3>

      {/* Affichage des options uniquement si aucune option n'est sélectionnée */}
      {!selectedOption ? (
        <>
          <p  >Choisissez une option pour continuer :</p>
          <div className="options-list">
            <OptionCard
              title="Consulter la liste des sujets et étudiants"
              description="Voir tous les sujets proposés et les étudiants associés."
              onClick={() => setSelectedOption("consult")}
            />

            <OptionCard
              title="Affecter les enseignants aux sujets"
              description="Assigner un enseignant pour chaque sujet proposé."
              onClick={() => setSelectedOption("affect")}
            />
          </div>
        </>
      ) : (
        <>
          {/* Bouton Retour pour revenir aux options */}
          <button
            className="button"
            onClick={() => setSelectedOption(null)}
          >
           Back  
          </button>

          {/* Affichage du contenu sélectionné */}
          <div className="content-section">
            {selectedOption === "consult" && <Consult />}
            {selectedOption === "affect" && <Affect />}
          </div>
        </>
      )}
    </div>
  );
};

export default ManageInternships;
