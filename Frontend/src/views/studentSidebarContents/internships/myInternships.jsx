import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectForm from "./ProjectForm";
import { getTopics } from "services/internshipservicesstudent";
import { Button, Card, Modal, Container, Row, Col } from "react-bootstrap";

const MyInternships = () => {
  const [showForm, setShowForm] = useState(false);
  const [topics, setTopics] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await getTopics();
      setTopics(data.topics);
    } catch (error) {
      console.error("Erreur lors du chargement des sujets :", error);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <Container className="mt-4">
      <h2>My Internships</h2>

      <Button
        variant="primary"
        className="position-fixed bottom-0 end-0 m-3"
        style={{
          width: "60px",
          height: "60px",
          fontSize: "36px",
          borderRadius: "50%",
          display: "flex", // Utilisation de flexbox
          alignItems: "center", // Centrer verticalement
          justifyContent: "center", // Centrer horizontalement
        }}
        onClick={toggleForm}
      >
        +
      </Button>

      {showForm && (
        <ProjectForm onTopicAdded={loadTopics} onClose={toggleForm} />
      )}

      <Row className="mt-4">
        {topics.map((topic) => (
          <Col key={topic.id} xs={12} md={6} lg={4} className="mb-4">
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title">{topic.titre}</h5>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default MyInternships;
