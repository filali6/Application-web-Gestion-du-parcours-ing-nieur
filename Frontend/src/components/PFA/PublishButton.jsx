import React from "react";
import Swal from "sweetalert2";
import { publishPFA, fetchPFAs } from "../../services/pfaService";
import "../../styles/pfa.css";

const PublishButton = ({ pfas, setPfas }) => {
  const isPublished = pfas.some((pfa) => pfa.status === "published");

  const handlePublish = async () => {
    Swal.fire({
      title: isPublished ? "Masquer la liste ?" : "Ouvrir / Modifier période ?",
      text: isPublished
        ? "Cela rendra les PFAs invisibles aux étudiants."
        : "Voulez-vous ouvrir la période de dépôt des choix ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isPublished ? "Masquer" : "Publier",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await publishPFA();
        const updatedPFAs = await fetchPFAs();
        setPfas(updatedPFAs);
        Swal.fire("Succès", "L'action a été effectuée.", "success");
      }
    });
  };

  return (
    <button className="publish-btn" onClick={handlePublish}>
      {isPublished ? "Masquer" : "Ouvrir / Modifier période"}
    </button>
  );
};

export default PublishButton;
