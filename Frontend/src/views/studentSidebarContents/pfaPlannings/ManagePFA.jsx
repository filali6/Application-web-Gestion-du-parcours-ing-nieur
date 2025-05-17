import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  Badge,
  Tab,
  Tabs,
  Spinner,
  Container,
  Row,
  Col,
  ListGroup,
} from 'react-bootstrap';
import {
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  GeoAlt as MapPinIcon,
  Person as UserIcon,
} from 'react-bootstrap-icons';

const ManagePlannings = () => {
  const [tab, setTab] = useState('pfa');
  const [planning, setPlanning] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanning = async () => {
      try {
        const API_URL = 'http://localhost:5000';
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/pfa/getStudentPlannings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlanning(res.data[0]);
      } catch (err) {
        console.error('Erreur de chargement du planning', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlanning();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-2">Chargement...</p>
      </div>
    );
  }

  if (!planning) {
    return <div className="text-center mt-5">Aucun planning trouvé.</div>;
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mon Planning de Soutenance</h2>
        <Tabs
          activeKey={tab}
          onSelect={(k) => setTab(k)}
          id="planning-tabs"
          className="mb-0"
        >
          <Tab eventKey="pfa" title="Voir PFA" />
          <Tab eventKey="pfe" title="Voir PFE" />
        </Tabs>
      </div>

      {tab === 'pfa' && (
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h4 className="mb-3">📌 Projet : {planning.project.title}</h4>
            <p className="text-muted">{planning.project.description}</p>

            <div className="mb-3">
              {planning.project.technologies.map((tech, idx) => (
                <Badge key={idx} bg="primary" className="me-2">
                  {tech}
                </Badge>
              ))}
            </div>

            <Row className="mb-3">
              <Col md={6} className="mb-2 d-flex align-items-center">
                <CalendarIcon className="me-2" />
                <span>{planning.date}</span>
              </Col>
              <Col md={6} className="mb-2 d-flex align-items-center">
                <ClockIcon className="me-2" />
                <span>
                  {planning.time} ({planning.duration} min)
                </span>
              </Col>
              <Col md={6} className="mb-2 d-flex align-items-center">
                <MapPinIcon className="me-2" />
                <span>Salle : {planning.room}</span>
              </Col>
              <Col md={6} className="mb-2 d-flex align-items-center">
                <UserIcon className="me-2" />
                <span>
                  Encadrant : {planning.encadrant.firstName} {planning.encadrant.lastName} (
                  <a href={`mailto:${planning.encadrant.email}`}>{planning.encadrant.email}</a>)
                </span>
              </Col>
              <Col md={6} className="mb-2 d-flex align-items-center">
                <UserIcon className="me-2" />
                <span>
                  Rapporteur : {planning.rapporteur.firstName} {planning.rapporteur.lastName} (
                  <a href={`mailto:${planning.rapporteur.email}`}>{planning.rapporteur.email}</a>)
                </span>
              </Col>
            </Row>

            <h5>Étudiants :</h5>
            <ListGroup variant="flush">
              {planning.project.Students.map((s, idx) => (
                <ListGroup.Item key={idx}>
                  {s.firstName} {s.lastName} (
                  <a href={`mailto:${s.email}`}>{s.email}</a>)
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      )}

      {tab === 'pfe' && (
        <div className="text-center text-muted mt-4">
          Module PFE non disponible pour le moment.
        </div>
      )}
    </Container>
  );
};

export default ManagePlannings;
