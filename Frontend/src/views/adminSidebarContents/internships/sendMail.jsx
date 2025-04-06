import React, { useState } from "react";
import { sendPlanningEmails } from "./serviceInternshipsAdmin";
import { Modal, Button, Form } from "react-bootstrap";

const SendMailModal = ({ show, toggleShow }) => {
  const [sendType, setSendType] = useState("first");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await sendPlanningEmails(sendType);
      if (response.success) {
        alert("Emails sent with success !");
        toggleShow();
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      alert("Erreur lors de l'envoi des emails");
    }
  };

  if (!show) return null;

  return (
    <Modal show={show} onHide={toggleShow}>
      <Modal.Header closeButton>
        <Modal.Title>Choose sent type</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Check
              type="radio"
              id="checkbox-first"
              label="First Sent"
              value="first"
              checked={sendType === "first"}
              onChange={() => setSendType("first")}
            />
            <Form.Check
              type="radio"
              id="checkbox-modified"
              label="Modified Sent "
              value="modified"
              checked={sendType === "modified"}
              onChange={() => setSendType("modified")}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={toggleShow}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" onClick={handleSubmit}>
          Send
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SendMailModal;
