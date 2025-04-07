import React from 'react';
import { Modal, Button, Tab, Tabs, ListGroup, Badge } from 'react-bootstrap';

const SubjectDetailsModal = ({ subject, show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{subject.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs defaultActiveKey="curriculum" className="mb-3">
          <Tab eventKey="curriculum" title="Curriculum">
            <div className="mt-3">
              <h5>Chapters</h5>
              <ListGroup>
                {subject.curriculum.chapters.map((chapter, index) => (
                  <ListGroup.Item key={index}>
                    <div className="fw-bold">{chapter.title}</div>
                    {chapter.sections && chapter.sections.length > 0 && (
                      <div className="ms-3 mt-2">
                        <h6>Sections:</h6>
                        <ul>
                          {chapter.sections.map((section, secIndex) => (
                            <li key={secIndex}>{section}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </Tab>
          <Tab eventKey="progress" title="My Progress">
            <div className="mt-3">
              {subject.progress && subject.progress.length > 0 ? (
                <ListGroup>
                  {subject.progress.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <div className="d-flex justify-content-between">
                        <span>{item.title}</span>
                        <Badge bg="success">Completed</Badge>
                      </div>
                      <small className="text-muted">
                        {new Date(item.completedDate).toLocaleDateString()}
                      </small>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-muted">No progress recorded yet.</div>
              )}
            </div>
          </Tab>
          <Tab eventKey="evaluations" title="Evaluations">
            <div className="mt-3">
              {subject.evaluations && subject.evaluations.length > 0 ? (
                <ListGroup>
                  {subject.evaluations.map((evalItem, index) => (
                    <ListGroup.Item key={index}>
                      <div className="fw-bold">Score: {evalItem.score}/100</div>
                      <div className="mt-2">{evalItem.feedback}</div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-muted">No evaluations yet.</div>
              )}
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SubjectDetailsModal;