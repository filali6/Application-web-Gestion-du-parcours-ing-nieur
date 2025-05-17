import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import GenericList from "../../../../components/Generic/GenericList";
import EditPlanningModal from "./EditPlanningModal";
import GeneratePlanningModal from "./GeneratePlanningModal";
import {
  fetchPlannings,
  publishPlannings,
  sendPlanningEmail,
} from "../../../../services/pfaService";

const columns = [
  { key: "title", header: "Titre" },
  { key: "description", header: "Description" },
  { key: "mode", header: "Mode" },
  { key: "students", header: "Étudiants" },
  { key: "encadrant", header: "Encadrant" },
  { key: "rapporteur", header: "Rapporteur" },
  { key: "date", header: "Date" },
  { key: "time", header: "Heure" },
  { key: "room", header: "Salle" },
  { key: "duration", header: "Durée" },
  { key: "status", header: "Statut" },
  { key: "update", header: "Action" },
];

const statusMap = {
  pending: { variant: "warning", label: "En attente" },
  published: { variant: "success", label: "Publié" },
  hidden: { variant: "secondary", label: "Masqué" },
};

const ManagePlannings = () => {
  const navigate = useNavigate();
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlanning, setEditingPlanning] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const handleUpdate = (planningId) => {
    const planning = plannings.find((p) => p._id === planningId);
    setEditingPlanning(planning);
    setShowModal(true);
  };

  useEffect(() => {
    loadPlannings();
  }, []);

  const loadPlannings = async () => {
    try {
      const data = await fetchPlannings();
      const transformedData = data.map((p) => ({
        ...p,
        title: p.project.title,
        description: p.project.description,
        mode: p.project.mode,
        students: p.project.Students.map((s) => `${s.firstName} ${s.lastName}`),
        encadrant: `${p.encadrant.firstName} ${p.encadrant.lastName}`,
        encadrantId: p.encadrant._id,
        rapporteur: `${p.rapporteur.firstName} ${p.rapporteur.lastName}`,
        rapporteurId: p.rapporteur._id,
        status: p.isPublished ? "published" : "hidden",
      }));
      setPlannings(transformedData);
    } catch (error) {
      console.error("Erreur lors du chargement des plannings:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasPublishedOrPending = plannings.some(
    (p) => p.status === "published" || p.status === "pending"
  );

  const publishButtonLabel = hasPublishedOrPending ? "Masquer" : "Publier";

  const handlePublish = async () => {
    Swal.fire({
      title: hasPublishedOrPending
        ? "Voulez-vous masquer toutes les soutenances ?"
        : "Publier toutes les soutenances ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: publishButtonLabel,
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await publishPlannings(
            hasPublishedOrPending ? "false" : "true"
          );
          const newStatus = hasPublishedOrPending ? "hidden" : "published";
          setPlannings((prev) =>
            prev.map((p) => ({
              ...p,
              status: newStatus,
            }))
          );
          Swal.fire({
            icon: response.success ? "success" : "warning",
            title: response.success ? "Succès" : "Attention",
            text: response.message || "Mise à jour effectuée",
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: error?.response?.data?.message || "Échec de la mise à jour",
          });
        }
      }
    });
  };

  const handleSendEmail = async () => {
    Swal.fire({
      title: "Envoyer la liste des soutenances ?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Envoyer",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await sendPlanningEmail();
          Swal.fire(
            "Succès",
            response.message || "Emails envoyés avec succès",
            "success"
          );
        } catch (error) {
          const errMsg =
            error.response?.data?.message || "Échec de l'envoi des emails.";
          Swal.fire("Erreur", errMsg, "error");
        }
      }
    });
  };

  const customRenderers = {
    students: (p) => <td>{p.students.join(", ")}</td>,
    update: (p) => (
      <td>
        <Button
          variant="warning"
          size="sm"
          onClick={() => handleUpdate(p._id)}
        >
          Modifier
        </Button>
      </td>
    ),
  };

  return (
    <div className="manage-planning p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Button variant="secondary" onClick={() => navigate("/pfa/manage-pfa")}>
            ← Retour
          </Button>
        </div>

        <div className="d-flex gap-2">


          <Button variant="success" onClick={() => setShowGenerateModal(true)}>
            Générer Plannings
          </Button>
            <Button variant="primary" onClick={handlePublish}>
            {publishButtonLabel}
          </Button>
                    <Button variant="success" onClick={handleSendEmail}>
            Envoyer Email
          </Button>
        </div>
      </div>

      <GenericList
        title="Liste des plannings de soutenance"
        fetchItems={() => Promise.resolve(plannings)}
        columns={columns}
        statusMap={statusMap}
        searchFields={["title", "students", "encadrant", "rapporteur", "room"]}
        customRenderers={customRenderers}
        noItemsMessage="Aucune soutenance disponible"
      />

      <EditPlanningModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onRefresh={loadPlannings}
        editingPlanning={editingPlanning}
      />

      <GeneratePlanningModal
        visible={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerated={loadPlannings}
      />
    </div>
  );
};

export default ManagePlannings;
