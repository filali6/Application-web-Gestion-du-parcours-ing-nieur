import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Container } from "react-bootstrap";
import { fetchTeacherTopics, getPlansDetails, updateSoutenance } from "./internshipsListservice";
import GenericList from "../../../components/Generic/GenericList";

const InternshipsList = () => {
  // États pour gérer le modal
  const [showModal, setShowModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [allTopics, setAllTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // États pour les champs du formulaire - nouveaux noms
  const [horaire, setHoraire] = useState("");
  const [date, setDate] = useState("");
  const [googleMeetLink, setGoogleMeetLink] = useState("");

  // Fonction pour formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Charger les sujets initialement
  useEffect(() => {
    const loadTopics = async () => {
      try {
        setLoading(true);

        const [topicsData, plansData] = await Promise.all([
          fetchTeacherTopics(),
          getPlansDetails(),
        ]);

        console.log("Topics récupérés :", topicsData);
        console.log("Plans récupérés :", plansData);

        // Fusionner chaque topic avec son plan associé s’il existe
        const topicsWithSchedule = topicsData.map((topic) => {
          // On suppose que topic._id ou topic.sujetId correspond au sujet du plan
          const matchingPlan = plansData.find(
            (plan) =>
              plan.sujet?._id === topic._id || plan.sujet?._id === topic.sujetId
          );

          const planningData = matchingPlan
            ? {
                date: matchingPlan.date || "",
                horaire: matchingPlan.horaire || "",
                googleMeetLink: matchingPlan.googleMeetLink || "",
              }
            : {
                date: "",
                horaire: "",
                googleMeetLink: "",
              };

          console.log(
            `Planning pour le sujet ${topic._id || topic.sujetId}:`,
            planningData
          );

          return {
            ...topic,
            ...planningData,
          };
        });

        setAllTopics(topicsWithSchedule);
      } catch (err) {
        console.error("Erreur lors du chargement des sujets et plans:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);
  

  // Fonction dédiée à la gestion des clics sur les lignes
  const handleRowClick = (topic) => {
    console.log("Fonction handleRowClick appelée avec:", topic);
    openModal(topic);
  };

  // Fonction pour ouvrir le modal
  const openModal = (topic) => {
    console.log("Ouverture du modal pour le sujet:", topic.sujetId);
    setSelectedTopic(topic);
    setHoraire(topic.horaire|| "");
    setDate(topic.date || "");
    setGoogleMeetLink(topic.googleMeetLink || "");
    setShowModal(true);
  };

  // Fonction pour fermer le modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTopic(null);
  };

  // Fonction pour sauvegarder les modifications
  // Fonction pour sauvegarder les modifications
  const handleSaveChanges = async () => {
    if (selectedTopic) {
      console.log("Sauvegarde des modifications pour:", selectedTopic);

      try {
        // Appel à la fonction de service updateSoutenance
        const result = await updateSoutenance(
          selectedTopic.sujetId,
          date,
          horaire,
          googleMeetLink
        );
           console.log("Données retournées après mise à jour:", result || "Aucune donnée retournée");
        // Mise à jour locale des sujets après succès de l'appel API
        const updatedTopics = allTopics.map((topic) => {
          if (topic.sujetId === selectedTopic.sujetId) {
            const updatedTopic = {
              ...topic,
              date: date,
              horaire: horaire,
              googleMeetLink: googleMeetLink,
            };
            console.log("Topic mis à jour:", updatedTopic);
            return updatedTopic;
          }
          return topic;
        });

        setAllTopics(updatedTopics);

        // Afficher un message de succès (optionnel)
        alert("La soutenance a été planifiée avec succès!");

        // Fermer le modal
        handleCloseModal();
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la soutenance:", error);
        console.error("Message d'erreur:", error.message);
        console.error("Stack trace:", error.stack);
        alert(
          "Erreur lors de la planification de la soutenance. Veuillez réessayer."
        );
      }
    }
  };

  // Fonction qui sera utilisée comme fetchItems pour le GenericList
  const getTopics = async () => {
    // Retourne les données déjà chargées
    console.log("getTopics retourne:", allTopics);
    return allTopics;
  };

  // Configuration pour le GenericList
  const internshipsConfig = {
    title: "Assigned Subjects",
    fetchItems: getTopics,
    columns: [
      { key: "sujetTitre", header: "Title Subject" },
      { key: "studentName", header: "Student" },
      { key: "studentEmail", header: "Email" },
      { key: "schedule", header: "Schedule" },
      { key: "documents", header: "Documents" },
      { key: "pv", header: "PV" },
    ],
    // Définir explicitement la fonction de clic de ligne
    onRowClick: handleRowClick,
    customRenderers: {
      sujetTitre: (topic) => {
        console.log("Rendu de la cellule sujetTitre pour:", topic.sujetId);
        return (
          <td
            key="sujetTitre"
            onClick={() => openModal(topic)}
            style={{ cursor: "pointer" }}
          >
            {topic.sujetTitre}
          </td>
        );
      },
      studentName: (topic) => (
        <td key="studentName">{topic.studentName || "Non précisé"}</td>
      ),
      studentEmail: (topic) => <td key="studentEmail">{topic.studentEmail}</td>,
      schedule: (topic) => { // Console.log de débogage pour voir les valeurs lors du rendu
      console.log("Rendu schedule pour topic:", { 
        id: topic.sujetId, 
        date: topic.date, 
        horaire: topic.horaire, 
        googleMeetLink: topic.googleMeetLink 
      }); 
      return (
        <td key="schedule">
          {topic.date && topic.horaire ? (
            <div>
              <div>
                <strong>Date:</strong> {formatDate(topic.date)}
              </div>
              <div>
                <strong>Heure:</strong> {topic.horaire}
              </div>
              {topic.googleMeetLink && (
                <div>
                  <a
                    href={topic.googleMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Lien Google Meet
                  </a>
                </div>
              )}
            </div>
          ) : (
            <span className="text-muted">Non planifié</span>
          )}
        </td>
      )},
      documents: (topic) => (
        <td key="documents">
          {topic.documents && topic.documents.length > 0
            ? topic.documents.map((doc, i) => (
                <div key={i}>
                  <a
                    href={`http://localhost:5000/uploads/${doc.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={doc.title}
                    onClick={(e) => e.stopPropagation()}
                  >
                    📄{doc.title}
                  </a>
                </div>
              ))
            : "Aucun document"}
        </td>
      ),
      pv: (topic) => <td key="pv">{topic.pv ? topic.pv : "Non disponible"}</td>,
    },
    searchFields: ["sujetTitre", "studentName", "studentEmail"],
    noItemsMessage: "No subjects found for this teacher",
    // Style pour indiquer que les lignes sont cliquables
    trProps: {
      style: { cursor: "pointer" },
      // Ajout d'un handler de clic directement sur les lignes tr
      onClick: (row) => {
        console.log("Clic sur tr avec les données:", row);
        handleRowClick(row);
      },
    },
  };

  return (
    <Container>
      <h2 className="mb-4">Internships List</h2>

      {/* Utilisation du composant GenericList */}
      <GenericList {...internshipsConfig} />

      {/* Modal pour planifier un rendez-vous */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Planifier un rendez-vous
            {selectedTopic && (
              <div className="text-muted fs-6">
                Sujet: {selectedTopic.sujetTitre}
              </div>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTopic && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Heure</Form.Label>
                <Form.Control
                  type="time"
                  value={horaire}
                  onChange={(e) => setHoraire(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Lien Google Meet</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  value={googleMeetLink}
                  onChange={(e) => setGoogleMeetLink(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Étudiant</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedTopic?.studentName || "Non précisé"}
                  disabled
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={selectedTopic?.studentEmail || ""}
                  disabled
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InternshipsList;
