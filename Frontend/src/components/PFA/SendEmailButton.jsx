import React from "react";
import Swal from "sweetalert2";
import { sendPfaEmail } from "../../services/pfaService";
import "../../styles/pfa.css";

const SendEmailButton = () => {
  const handleSendEmail = async () => {
    Swal.fire({
      title: "Envoyer la liste ?",
      text: "Un email sera envoyé à tous les étudiants et enseignants.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Envoyer",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await sendPfaEmail();
        Swal.fire("Succès", "Email envoyé avec succès !", "success");
      }
    });
  };

  return (
    <button className="send-email-btn" onClick={handleSendEmail}>
      Envoyer la liste
    </button>
  );
};

export default SendEmailButton;
