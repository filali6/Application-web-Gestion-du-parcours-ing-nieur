import React from "react";
import { Modal, Button, ListGroup } from "react-bootstrap";

const SkillDetailsModal = ({ skill, show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{skill?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <h5>Description</h5>
          <p>{skill?.description || "No description available"}</p>
        </div>

        <div>
          <h5>Related Subjects</h5>
          <ListGroup>
            {skill?.subjects?.map(subject => (
              <ListGroup.Item key={subject.id}>
                <strong>{subject.title}</strong> ({subject.level})
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SkillDetailsModal;