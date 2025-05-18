import React, { useState, useEffect } from "react";
import { Button, Modal, Row, Col, Badge, Card } from "react-bootstrap";
import GenericList from "../../../components/Generic/GenericList";
import { fetchMyPlannings } from "../../../services/pfaService";
import { FaUserTie, FaClock, FaUsers, FaLaptopCode, FaCalendarAlt, FaDoorOpen } from "react-icons/fa";

const columns = [
  { key: "title", header: "Titre" },
  { key: "mode", header: "Mode" },
  { key: "students", header: "Étudiants" },
  { key: "encadrant", header: "Encadrant" },
  { key: "rapporteur", header: "Rapporteur" },
  { key: "date", header: "Date" },
  { key: "time", header: "Heure" },
  { key: "room", header: "Salle" },
  { key: "duration", header: "Durée" },
  { key: "action", header: "Action" },
];

const ManagePlannings = () => {
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPlannings();
  }, []);

  const loadPlannings = async () => {
    try {
      const data = await fetchMyPlannings();
      const transformedData = data.map(p => ({
        ...p,
        title: p.project.title,
        description: p.project.description,
        mode: p.project.mode,
        technologies: p.project.technologies || [],
        students: p.project.Students.map(s => `${s.firstName} ${s.lastName}`),
        encadrant: `${p.encadrant.firstName} ${p.encadrant.lastName}`,
        rapporteur: `${p.rapporteur.firstName} ${p.rapporteur.lastName}`,
      }));
      setPlannings(transformedData);
    } catch (error) {
      console.error("Erreur lors du chargement des plannings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsult = (planning) => {
    setSelectedProject(planning);
    setShowModal(true);
  };

  const customRenderers = {
    students: (p) => <td>{p.students.join(", ")}</td>,
    action: (p) => (
      <td>
        <Button variant="dark" size="sm" onClick={() => handleConsult(p)}>
          Consulter
        </Button>
      </td>
    ),
  };

  return (
    <div className="manage-planning">
      <GenericList
        title="Liste des plannings de soutenance"
        fetchItems={() => Promise.resolve(plannings)}
        columns={columns}
        searchFields={["title", "students", "encadrant", "rapporteur", "room"]}
        customRenderers={customRenderers}
        noItemsMessage="Aucune soutenance disponible"
        loading={loading}
      />

      {/* Modal moderne avec carte stylisée */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Détails de la soutenance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProject && (
            <Card className="shadow-sm border-0 p-3">
              <Card.Body>
                <h4 className="text-primary mb-3">{selectedProject.title}</h4>
                <p className="text-muted">{selectedProject.description}</p>
                <hr />

                <Row className="mb-4">
                  <Col md={6}>
                    <p><FaUserTie className="me-2 text-secondary" /> <strong>Encadrant :</strong> {selectedProject.encadrant}</p>
                    <p><FaUserTie className="me-2 text-secondary" /> <strong>Rapporteur :</strong> {selectedProject.rapporteur}</p>
                    <p><FaUsers className="me-2 text-secondary" /> <strong>Étudiants :</strong></p>
                    {selectedProject.students.map((s, i) => (
                      <Badge key={i} bg="info" className="me-2 mb-1">{s}</Badge>
                    ))}
                  </Col>
                  <Col md={6}>
                    <p><FaCalendarAlt className="me-2 text-secondary" /> <strong>Date :</strong> {selectedProject.date}</p>
                    <p><FaClock className="me-2 text-secondary" /> <strong>Heure :</strong> {selectedProject.time}</p>
                    <p><FaDoorOpen className="me-2 text-secondary" /> <strong>Salle :</strong> {selectedProject.room}</p>
                    <p><FaClock className="me-2 text-secondary" /> <strong>Durée :</strong> {selectedProject.duration} min</p>
                    <p><FaLaptopCode className="me-2 text-secondary" /> <strong>Mode :</strong> {selectedProject.mode}</p>
                  </Col>
                </Row>

                <h6 className="text-secondary mt-3">Technologies utilisées :</h6>
                {selectedProject.technologies.length > 0 ? (
                  <div className="d-flex flex-wrap mt-2">
                    {selectedProject.technologies.map((tech, idx) => (
                      <Badge key={idx} bg="dark" className="me-2 mb-2 px-3 py-2" style={{ fontSize: "0.85rem" }}>
                        {tech}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted fst-italic">Aucune technologie spécifiée.</p>
                )}
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManagePlannings;
