import React, { useEffect, useState } from "react";
import { fetchTeachers } from "./serviceInternshipsAdmin";
import { Modal, Button, Form } from "react-bootstrap";

const UpdatePlanModal = ({ show, toggleShow, onSubmit, plan }) => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const data = await fetchTeachers();
        setTeachers(data);
      } catch (error) {
        console.error("Erreur lors du chargement des enseignants :", error);
      }
    };
    loadTeachers();
  }, []);

  useEffect(() => {
    if (plan?.teachers?._id) {
      setSelectedTeacherId(plan.teachers._id); // Définit l'enseignant actuel
    } else if (plan?.teachers) {
      setSelectedTeacherId(plan.teachers); // fallback au cas où ce n’est pas un objet
    }
  }, [plan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTeacherId) {
      try {
        await onSubmit(plan._id, selectedTeacherId, plan.sujet._id); // Mise à jour
        toggleShow(); // Ferme le popup après soumission
        setSelectedTeacherId(""); // Réinitialise la sélection de l'enseignant
      } catch (error) {
        alert("Erreur lors de l'affectation de l'enseignant.");
      }
    } else {
      alert("Veuillez sélectionner un enseignant.");
    }
  };

  return (
    <Modal show={show} onHide={toggleShow} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update  planning</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Select enseignant */}
          <Form.Group controlId="teacher" className="mb-3">
            <Form.Label>Select  a  teacher  :</Form.Label>
            <Form.Control
              as="select"
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              required
            >
              <option value="">-- Choisir un enseignant --</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          {/* Boutons */}
          <div className="d-flex justify-content-end gap-3">
            <Button variant="secondary" onClick={toggleShow}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdatePlanModal;
