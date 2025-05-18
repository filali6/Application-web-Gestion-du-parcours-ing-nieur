import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Tab,
  Tabs,
  ListGroup,
  Badge,
  Form,
} from "react-bootstrap";
import {
  getSubjectProgress,
  addSubjectEvaluation,
} from "../../../services/subjects.service";

import Swal from "sweetalert2";

const SubjectDetailsModal = ({ subject, show, onHide }) => {
  const [progress, setProgress] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(5);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("curriculum");

  useEffect(() => {
    if (show && subject?._id) {
      getSubjectProgress(subject._id)
        .then((data) => {
          setProgress(data.progress || []);
        })
        .catch((err) => {
          console.error("Error fetching progress:", err);
        });

      // Check if student has already evaluated
      const localStorageCheck = localStorage.getItem(`eval_${subject._id}`);
      setHasEvaluated(!!localStorageCheck);
    }
  }, [show, subject]);

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    if (tab === "evaluations" && hasEvaluated) {
      Swal.fire({
        title: "Evaluation Submitted",
        text: "You have already submitted your evaluation for this subject.",
        icon: "info",
        confirmButtonText: "OK",
      });
    }
  };

  // Calcule le pourcentage global de complétion
  const calculateCompletionPercentage = () => {
    if (!progress || !subject?.curriculum?.chapters) return 0;

    let totalItems = 0;
    subject.curriculum.chapters.forEach((chapter) => {
      if (chapter.sections && chapter.sections.length > 0) {
        totalItems += chapter.sections.length;
      } else {
        totalItems += 1;
      }
      totalItems += 1; // chapitre lui-même
    });

    if (totalItems === 0) return 0;

    let completedItems = 0;

    subject.curriculum.chapters.forEach((chapter) => {
      const isChapterCompleted = progress.some(
        (p) => p.title === chapter.title && !p.title.includes("-")
      );

      if (isChapterCompleted) {
        completedItems += 1;
      }

      if (chapter.sections) {
        chapter.sections.forEach((section) => {
          const isSectionCompleted = progress.some(
            (p) => p.title === `${chapter.title} - ${section}`
          );
          if (isSectionCompleted) {
            completedItems += 1;
          }
        });
      }
    });

    const percentage = Math.round((completedItems / totalItems) * 100);
    return Math.min(percentage, 100);
  };
  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await addSubjectEvaluation(subject._id, {
        feedback,
        score,
      });

      localStorage.setItem(`eval_${subject._id}`, "submitted");
      setHasEvaluated(true);

      Swal.fire({
        title: "Thank You!",
        text: "Your evaluation has been submitted successfully.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        onHide();
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit evaluation");
      Swal.fire({
        title: "Error",
        text: err.response?.data?.error || "Failed to submit evaluation",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper pour vérifier si un chapitre est complété
  const isChapterCompleted = (chapterTitle) => {
    return progress.some(
      (p) => p.title === chapterTitle && !p.title.includes("-")
    );
  };

  // Helper pour vérifier si une section est complétée
  const isSectionCompleted = (chapterTitle, sectionTitle) => {
    return progress.some(
      (p) => p.title === `${chapterTitle} - ${sectionTitle}`
    );
  };

  // Récupérer la date de complétion d'une section
  const getSectionCompletionDate = (chapterTitle, sectionTitle) => {
    const item = progress.find(
      (p) => p.title === `${chapterTitle} - ${sectionTitle}`
    );
    return item ? new Date(item.completedDate).toLocaleDateString() : null;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{subject.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          defaultActiveKey="curriculum"
          className="mb-3"
          onSelect={handleTabSelect}
        >
          <Tab eventKey="curriculum" title="Curriculum">
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">Course Progress</h5>
                <Badge bg="info" pill>
                  {calculateCompletionPercentage()}% Complete
                </Badge>
              </div>
              <div className="progress" style={{ height: "10px" }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${calculateCompletionPercentage()}%` }}
                  aria-valuenow={calculateCompletionPercentage()}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>

            <div className="mt-3">
              <h5>Chapters</h5>
              <ListGroup>
                {subject.curriculum.chapters.map((chapter, index) => {
                  const chapterCompleted = isChapterCompleted(chapter.title);

                  return (
                    <ListGroup.Item
                      key={index}
                      className={chapterCompleted ? "bg-light" : ""}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="fw-bold">
                          {chapter.title}
                          {chapterCompleted && (
                            <Badge bg="success" className="ms-2">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>

                      {chapter.sections && chapter.sections.length > 0 && (
                        <div className="ms-3 mt-2">
                          <h6>Sections:</h6>
                          <ul className="list-unstyled">
                            {chapter.sections.map((section, secIndex) => {
                              const sectionCompleted = isSectionCompleted(
                                chapter.title,
                                section
                              );
                              const completionDate = getSectionCompletionDate(
                                chapter.title,
                                section
                              );

                              return (
                                <li
                                  key={secIndex}
                                  className="d-flex justify-content-between align-items-center my-1 p-2 rounded"
                                  style={{
                                    backgroundColor: sectionCompleted
                                      ? "#f8f9fa"
                                      : "transparent",
                                  }}
                                >
                                  <div>
                                    <span
                                      className={
                                        sectionCompleted
                                          ? "text-decoration-line-through text-muted"
                                          : ""
                                      }
                                    >
                                      {section}
                                    </span>
                                    {sectionCompleted && (
                                      <small className="text-success ms-2">
                                        (Completed on {completionDate})
                                      </small>
                                    )}
                                  </div>

                                  {sectionCompleted && (
                                    <Badge bg="success" pill>
                                      <i className="bi bi-check"></i>
                                    </Badge>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </div>
          </Tab>

          <Tab eventKey="evaluations" title="Evaluations">
            <div className="mt-3">
              {!hasEvaluated ? (
                <div>
                  <h5>Submit Your Evaluation</h5>
                  <Form onSubmit={handleSubmitEvaluation}>
                    <Form.Group className="mb-3">
                      <Form.Label>Score (0-10)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        max="10"
                        value={score}
                        onChange={(e) => setScore(parseInt(e.target.value))}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Feedback</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        required
                        placeholder="What did you like about this course? What could be improved?"
                      />
                    </Form.Group>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Evaluation"}
                    </Button>
                  </Form>
                </div>
              ) : null}
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
