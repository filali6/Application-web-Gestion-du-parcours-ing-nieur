import React, { useState } from "react";
import { addTopic } from "services/internshipservicesstudent";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";

const ProjectForm = ({ onTopicAdded, onClose }) => {
  const [titre, setTitre] = useState("");
  const [documents, setDocuments] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setDocuments(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("titre", titre);

    if (documents) {
      for (let i = 0; i < documents.length; i++) {
        formData.append("documents", documents[i]); // Ajoute chaque fichier
      }
    }

    try {
      const result = await addTopic(formData);
      alert("Sujet déposé avec succès !");
      console.log(result);
      if (onTopicAdded) onTopicAdded(result);
      navigate("/myinternships");
      if (onClose) onClose();
    } catch (error) {
      alert("Erreur lors du dépôt du sujet.");
      console.error("Erreur lors du dépôt du sujet :", error);
    }
  };

  return (
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Déposer un sujet</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Titre Input */}
          <Form.Group controlId="titre">
            <Form.Label>Titre du sujet</Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrez le titre du sujet"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
            />
          </Form.Group>

          {/* File Upload */}
          <Form.Group controlId="documents">
            <Form.Label>Choisir des fichiers</Form.Label>
            <InputGroup>
              <Form.Control
                type="file"
                multiple
                onChange={handleFileChange}
                required
              />
            </InputGroup>
          </Form.Group>

          {/* Submit Button */}
          <Button variant="success" type="submit" className="w-100 mt-3">
            Déposer le sujet
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ProjectForm;
