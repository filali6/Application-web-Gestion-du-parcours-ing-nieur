import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import GenericList from "../../../components/Generic/GenericList";
import {
  fetchPFAs,
  publishPFAs,
  sendPfaEmail,
  rejectPfa,
} from "../../../services/pfaService";
import PeriodTypeSelect from "../../../components/Fields/PeriodTypeSelect";
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
  const navigate = useNavigate(); // ← Pour la navigation

  const [pfas, setPfas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("");

  const periodTypes = [{ value: "1", label: "Période de choix" }];

  useEffect(() => {
    loadPFAs();
  }, []);

  const loadPFAs = async () => {
    try {
      const data = await fetchPFAs();
      setPfas(data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des PFAs:", error);
      setLoading(false);
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
        await publishPFAs(hasPublishedOrPending ? "false" : "true");

        if (!hasPublishedOrPending) {
          Swal.fire({
            title: "Ouvrir/modifier la période de choix ?",
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Oui",
            cancelButtonText: "Non",
          }).then((result) => {
            if (result.isConfirmed) {
              navigate("/periode/manage-periode", {
                state: { fromManagePFA: true },
              }); // ← Redirection avec état
            }
          });
        }

        loadPFAs();
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
        await sendPfaEmail();
        Swal.fire("Envoyé !", "La liste des PFAs a été envoyée.", "success");
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
        await rejectPfa(id);
        setPfas((prevPFAs) =>
          prevPFAs.map((pfa) =>
            pfa._id === id ? { ...pfa, status: "rejected" } : pfa
          )
        );
      }
    });
  };

  const handlePeriodChange = (event) => {
    setSelectedPeriod(event.target.value);
  };

  const handleConfirmPeriod = () => {
    setShowPeriodModal(false);
    Swal.fire(
      "Période enregistrée",
      `Vous avez choisi ${selectedPeriod}`,
      "success"
    );
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
        </div>
      </div>

      <GenericList
        title="Liste des PFAs"
        fetchItems={fetchPFAs}
        columns={columns}
        statusMap={statusMap}
        searchFields={["title", "students", "teacher", "year"]}
        customRenderers={customRenderers}
        noItemsMessage="Aucun PFA disponible"
        items={pfas}
      />

      {/* Modal de sélection de la période */}
      <Modal
        show={showPeriodModal}
        onHide={() => setShowPeriodModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Choisir une période</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PeriodTypeSelect
            value={selectedPeriod}
            onChange={handlePeriodChange}
            periodTypes={periodTypes}
            error={!selectedPeriod ? "Veuillez sélectionner une période" : ""}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPeriodModal(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmPeriod}
            disabled={!selectedPeriod}
          >
            Confirmer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManagePFA;
