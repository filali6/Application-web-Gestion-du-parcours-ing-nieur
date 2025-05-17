import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import GenericList from "../../../components/Generic/GenericList";

import {
  fetchPFAs,
  publishPFAs,
  sendPfaEmail,
  rejectPfa,
} from "../../../services/pfaService";
import "../../../styles/pfa.css";

// Définition des colonnes pour la table
const columns = [
  { key: "title", header: "Titre" },
  { key: "description", header: "Description" },
  { key: "mode", header: "Mode" },
  { key: "students", header: "Étudiants" },
  { key: "teacher", header: "Enseignant" },
  { key: "year", header: "Année" },
  { key: "status", header: "Statut" },
  { key: "reject", header: "Action" },
];

const statusMap = {
  pending: { variant: "warning", label: "En attente" },
  published: { variant: "success", label: "Publié" },
  hidden: { variant: "secondary", label: "Masqué" },
  rejected: { variant: "danger", label: "Rejeté" },
};

const ManagePFA = () => {
  const navigate = useNavigate();
  const [pfas, setPfas] = useState([]);
  const [loading, setLoading] = useState(true);


  const [showModal, setShowModal] = useState(false); // Pour la modale d'édition
const [editingPlanning, setEditingPlanning] = useState(null); // Pour stocker le planning à éditer

const [showGenerateModal, setShowGenerateModal] = useState(false); // Pour la modale de génération
const [plannings, setPlannings] = useState([]);


  useEffect(() => {
    loadPFAs();
  }, []);

  const loadPFAs = async () => {
    try {
      const data = await fetchPFAs();
      setPfas(data);
    } catch (error) {
      console.error("Erreur lors du chargement des PFAs:", error);
    } finally {
      setLoading(false);
    }
  };


  const loadPlannings = async () => {
  try {
    const data = await fetchPlannings(); // à créer ou importer selon ton service
    setPlannings(data); // un state planning à ajouter
  } catch (error) {
    console.error("Erreur lors du chargement des plannings:", error);
  }
};

  const hasPublishedOrPending = pfas.some(
    (pfa) => pfa.status === "published" || pfa.status === "pending"
  );

  const publishButtonLabel = hasPublishedOrPending ? "Masquer" : "Publier";

  const handlePublish = async () => {
    Swal.fire({
      title: hasPublishedOrPending
        ? "Voulez-vous masquer tous les PFAs ?"
        : "Publier tous les PFAs ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: hasPublishedOrPending ? "Masquer" : "Publier",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await publishPFAs(hasPublishedOrPending ? "false" : "true");

          const newStatus = hasPublishedOrPending ? "hidden" : "published";
          setPfas((prevPfas) =>
            prevPfas.map((pfa) => ({
              ...pfa,
              status: newStatus,
            }))
          );

          if (!hasPublishedOrPending) {
            Swal.fire({
              title: "Souhaitez-vous aller à la gestion des périodes ?",
              icon: "info",
              showCancelButton: true,
              confirmButtonText: "Oui",
              cancelButtonText: "Non",
            }).then((res) => {
              if (res.isConfirmed) {
                navigate("/periode/manage-periode", {
                  state: { fromManagePFA: true },
                });
              }
            });
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.error ||
            "Erreur lors de la publication/masquage des PFAs.";
          Swal.fire("Erreur", errorMessage, "error");
        }
      }
    });
  };

  const handleSendEmail = async () => {
    Swal.fire({
      title: "Confirmer l'envoi des PFAs ?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Envoyer",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await sendPfaEmail();
          Swal.fire("Envoyé !", "La liste des PFAs a été envoyée.", "success");
        } catch (error) {
          Swal.fire("Erreur", "Échec de l'envoi des emails.", "error");
        }
      }
    });
  };

  const handleReject = async (id) => {
    Swal.fire({
      title: "Voulez-vous vraiment rejeter ce PFA ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Rejeter",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await rejectPfa(id);
          Swal.fire("Succès", "Le PFA a été rejeté avec succès.", "success");

          setPfas((prevPfas) =>
            prevPfas.map((pfa) =>
              pfa._id === id ? { ...pfa, status: "rejected" } : pfa
            )
          );
        } catch (error) {
          const errorMessage =
            error.response?.data?.error || "Erreur lors du rejet du PFA.";
          Swal.fire("Erreur", errorMessage, "error");
        }
      }
    });
  };

  const customRenderers = {
    students: (pfa) => (
      <td>
        {pfa.students.length > 0 ? pfa.students.join(", ") : "Aucun étudiant"}
      </td>
    ),
    reject: (pfa) => (
      <td>
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleReject(pfa._id)}
          disabled={pfa.status === "rejected"}
        >
          Rejeter
        </Button>
      </td>
    ),
  };

  return (
    <div className="manage-pfa">
      <div className="pfa-header">
        <div className="pfa-buttons">
          <Button variant="primary" onClick={handlePublish}>
            {publishButtonLabel}
          </Button>
          <Button variant="success" onClick={handleSendEmail}>
            Envoyer Email
          </Button>
          <Button variant="info" onClick={() => navigate("/pfa/validate-pfa")}>
            Valider PFAs
          </Button>
          <Button variant="info" onClick={() => navigate("/pfa/planning")}>
            Gérer plannings
          </Button>
        </div>
      </div>

      <GenericList
        title="Liste des PFAs"
        fetchItems={() => Promise.resolve(pfas)} // ✅ Utilise le state local
        columns={columns}
        statusMap={statusMap}
        searchFields={["title", "students", "teacher", "year"]}
        customRenderers={customRenderers}
        noItemsMessage="Aucun PFA disponible"
      />
    </div>
  );
};

export default ManagePFA;
