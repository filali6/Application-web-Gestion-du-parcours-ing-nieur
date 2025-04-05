import React, { useState } from "react";
import { sendPlanningEmails } from "./emailService";
import "./Update.css";
import { MDBCheckbox } from "mdb-react-ui-kit";

const UpdatePlanModal = ({ show, toggleShow }) => {
  const [sendModified, setSendModified] = useState(false);
  const [firstSend, setFirstSend] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sendType = sendModified ? "modified" : firstSend ? "first" : null;

    if (!sendType) {
      alert("Veuillez sélectionner un type d'envoi.");
      return;
    }

    try {
      const result = await sendPlanningEmails(sendType);
      alert(result.message || "Envoi terminé.");

      if (result.success) {
        toggleShow();
        setSendModified(false);
        setFirstSend(false);
      }
    } catch (error) {
      alert("Erreur lors de l'envoi : " + error.message);
    }
  };

  const handleModifiedChange = (e) => {
    setSendModified(e.target.checked);
    if (e.target.checked) setFirstSend(false);
  };

  const handleFirstSendChange = (e) => {
    setFirstSend(e.target.checked);
    if (e.target.checked) setSendModified(false);
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={toggleShow}>
          ✖
        </button>
        <h2>Choisissez le type d'envoi</h2>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="input-group">
            <MDBCheckbox
              id="sendModifiedCheckbox"
              label="Envoyer les modifications"
              checked={sendModified}
              onChange={handleModifiedChange}
            />
            <MDBCheckbox
              id="firstSendCheckbox"
              label="Premier envoi"
              checked={firstSend}
              onChange={handleFirstSendChange}
            />
          </div>

          <div className="button-group">
            <button
              type="button"
              className="cancel-button"
              onClick={toggleShow}
            >
              Annuler
            </button>
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
