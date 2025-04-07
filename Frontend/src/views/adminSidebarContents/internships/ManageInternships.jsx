import React, { useState } from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import Consult from "./Consult";
import Affect from "./Affect";

const OptionCard = ({ title, description, onClick }) => {
  return (
    <Card className="shadow-sm" onClick={onClick} style={{ cursor: "pointer" }}>
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{description}</Card.Text>
      </Card.Body>
    </Card>
  );
};

const ManageInternships = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <Container className="py-4">
      <h3>Manage Internships</h3>

      {/* Affichage des options uniquement si aucune option n'est sélectionnée */}
      {!selectedOption ? (
        <>
          <p>Choose an option to continue:</p>
          <Row className="g-4">
            <Col md={6}>
              <OptionCard
                title="View the list of subjects and students."
                description="See all the proposed subjects and the associated students."
                onClick={() => setSelectedOption("consult")}
              />
            </Col>
            <Col md={6}>
              <OptionCard
                title="Assign teachers to subjects."
                description="Assign a teacher to each proposed subject."
                onClick={() => setSelectedOption("affect")}
              />
            </Col>
          </Row>
        </>
      ) : (
        <>
          {/* Bouton Retour pour revenir aux options */}
          <Button
            variant="outline-primary"
            onClick={() => setSelectedOption(null)}
          >
            Back
          </Button>

          {/* Affichage du contenu sélectionné */}
          <div className="mt-4">
            {selectedOption === "consult" && <Consult />}
            {selectedOption === "affect" && <Affect />}
          </div>
        </>
      )}
    </Container>
  );
};

export default ManageInternships;
