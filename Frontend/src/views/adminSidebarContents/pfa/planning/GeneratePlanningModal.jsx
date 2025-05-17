import React, { useState } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { generateSoutenances } from "../../../../services/pfaService";
import { XCircleFill } from "react-bootstrap-icons";

const predefinedRooms = ["Salle 1", "Salle 2", "Salle 3", "Salle 4"];
const roomOptions = predefinedRooms.map((room) => ({
  label: room,
  value: room,
}));

const GeneratePlanningModal = ({ visible, onClose, onGenerated }) => {
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);

  const handleRoomSelectChange = (selectedOptions) => {
    setSelectedRooms(selectedOptions || []);
  };

  const handleAddDate = (date) => {
    if (!date) return;

    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (!selectedDates.find((d) => d.getTime() === normalizedDate.getTime())) {
      setSelectedDates([...selectedDates, normalizedDate]);
    }
  };

  const handleRemoveDate = (dateToRemove) => {
    setSelectedDates(selectedDates.filter((d) => d.getTime() !== dateToRemove.getTime()));
  };

  const handleSubmit = async () => {
    if (selectedRooms.length === 0 || selectedDates.length === 0) {
      Swal.fire("Erreur", "Veuillez sélectionner au moins une salle et une date.", "error");
      return;
    }

    const selectedRoomValues = selectedRooms.map((opt) => opt.value);

    // Convertir les dates vers le format YYYY-MM-DD
    const formattedDates = selectedDates.map((d, i) => {
      let dateObj = d;

      if (!(d instanceof Date)) {
        try {
          dateObj = new Date(d);
        } catch (e) {
          console.error(`Erreur de conversion pour la date à l’index ${i}`, d);
          return null;
        }
      }

      if (isNaN(dateObj.getTime())) {
        console.error(`Date invalide à l’index ${i}:`, d);
        return null;
      }

      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }).filter(Boolean); // enlève les null


    try {
      await generateSoutenances(selectedRoomValues, formattedDates);
      Swal.fire("Succès", "Plannings générés avec succès", "success");
      onGenerated();
      onClose();
    } catch (error) {
      Swal.fire("Erreur", error.message || "Erreur serveur", "error");
    }
  };

  return (
    <Modal show={visible} onHide={onClose} centered dialogClassName="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">📅 Générer les plannings de soutenance</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ backgroundColor: "#ffffff" }}>
        <Form>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Salles disponibles :</Form.Label>
            <Select
              isMulti
              options={roomOptions}
              value={selectedRooms}
              onChange={handleRoomSelectChange}
              placeholder="Sélectionner une ou plusieurs salles"
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="fw-semibold">Ajouter des dates :</Form.Label>
            <DatePicker
              selected={null}
              onChange={handleAddDate}
              placeholderText="Cliquez pour ajouter une date"
              dateFormat="dd/MM/yyyy"
              className="form-control"
            />

            {selectedDates.length > 0 && (
              <div className="mt-3 d-flex flex-wrap gap-2">
                {selectedDates.map((date, idx) => (
                  <Badge
                    key={idx}
                    bg="info"
                    className="d-flex align-items-center p-2"
                    style={{ fontSize: "0.9rem", borderRadius: "1rem" }}
                  >
                    {date.toLocaleDateString()}
                    <XCircleFill
                      className="ms-2"
                      role="button"
                      onClick={() => handleRemoveDate(date)}
                      style={{ cursor: "pointer" }}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Générer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GeneratePlanningModal;
