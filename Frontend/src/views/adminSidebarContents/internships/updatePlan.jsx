import React, { useState } from "react";
import { sendPlanningEmails } from "./serviceInternshipAdmin";
import "./Update.css";
import { MDBCheckbox } from "mdb-react-ui-kit";

const UpdatePlanModal = ({ show, toggleShow }) => {
  const [sendType, setSendType] = useState("first");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await sendPlanningEmails(sendType);
      if (response.success) {
        alert("Emails envoyés avec succès !");
        toggleShow();
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      alert("Erreur lors de l'envoi des emails");
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={toggleShow}>
          ✖
        </button>

        <h2>Choisir type d'envoi</h2>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="input-group">
            <MDBCheckbox
              name="sendType"
              id="checkbox-first"
              value="first"
              label="Premier envoi"
              checked={sendType === "first"}
              onChange={() => setSendType("first")}
            />
            <MDBCheckbox
              name="sendType"
              id="checkbox-modified"
              value="modified"
              label="Envoi modifié"
              checked={sendType === "modified"}
              onChange={() => setSendType("modified")}
            />
          </div>

          <div className="button-group">
            <button type="submit" className="submit-button">
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePlanModal;
