import React, { useState } from "react";
import { addTopic } from "services/internshipservices";
import { useNavigate } from "react-router-dom";
import "./Form.css"
const ProjectForm = ({onTopicAdded,onClose}) => {
  const [titre, setTitre] = useState("");
  const [documents, setDocuments] = useState(null);
  const navigate= useNavigate();

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
      // Appeler la fonction pour mettre à jour la liste des sujets
      if (onTopicAdded) onTopicAdded(result);

      // Naviguer vers la page MyInternships
      navigate("/myinternships");
      if (onClose) onClose(); 
    } catch (error) {
      alert("Erreur lors du dépôt du sujet.");
      console.error("Erreur lors du dépôt du sujet :", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Close Button */}
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        <h2>Déposer un sujet</h2>

        <form onSubmit={handleSubmit} className="project-form">
          {/* Title Input */}
          <div className="input-group">
            <input
              type="text"
              placeholder="Titre du sujet"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {/* File Upload */}
          <div className="file-upload">
            <input
              type="file"
              id="file"
              multiple
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="file" className="file-label">
              📎 Choisir des fichiers
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-button">
            Déposer le sujet
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
