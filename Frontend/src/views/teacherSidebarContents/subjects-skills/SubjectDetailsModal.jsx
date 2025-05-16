import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Tab,
  Tabs,
  ListGroup,
  Badge,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import Swal from "sweetalert2"; // Import SweetAlert

import {
  addProposition,
  fetchSubjectById,
  updateSubjectProgress,
} from "../../../services/subjects.service";

const SubjectDetailsModal = ({ subject, show, onHide, currentUser }) => {
  const [subjectData, setSubjectData] = useState(subject || {});
  const [propositions, setPropositions] = useState(subject.propositions || []);
  const [newProp, setNewProp] = useState({
    date: new Date().toISOString(),
    reason: "",
    submittedBy: currentUser?._id || "", // Use currentUser's ID
    validated: false,
    changes: {
      level: "",
      semester: "",
      curriculum: { chapters: [] },
    },
  });

  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterSections, setChapterSections] = useState([]);
  const [sectionText, setSectionText] = useState("");

  useEffect(() => {
    setSubjectData(subject);
    setPropositions(subject.propositions || []);
  }, [subject]);

  const calculateCompletionPercentage = () => {
    if (!subjectData.progress || !subjectData.curriculum.chapters) return 0;

    // Count all chapters (regardless of sections)
    const totalChapters = subjectData.curriculum.chapters.length;
    if (totalChapters === 0) return 0;

    // Count completed chapters
    const completedChapters = subjectData.curriculum.chapters.filter(
      (chapter) => {
        return subjectData.progress.some(
          (p) => p.title === chapter.title && !p.title.includes("-")
        );
      }
    ).length;

    // Calculate percentage based only on chapters
    const percentage = Math.round((completedChapters / totalChapters) * 100);
    return Math.min(percentage, 100); // Cap at 100%
  };

  // Add this helper function to check if previous items are completed
  const isPreviousCompleted = (chapterIndex, sectionIndex = null) => {
    const { progress = [], curriculum } = subjectData;

    // For chapters
    if (sectionIndex === null) {
      // First chapter can always be marked
      if (chapterIndex === 0) return true;

      // Check if previous chapter is completed
      const prevChapter = curriculum.chapters[chapterIndex - 1];
      const isPrevChapterCompleted = progress.some(
        (p) => p.title === prevChapter.title && !p.title.includes("-")
      );

      // For chapters with sections, ensure all sections are completed
      if (prevChapter.sections?.length > 0) {
        const allSectionsCompleted = prevChapter.sections.every((section) =>
          progress.some((p) => p.title === `${prevChapter.title} - ${section}`)
        );
        return isPrevChapterCompleted && allSectionsCompleted;
      }

      return isPrevChapterCompleted;
    }

    // For sections
    if (sectionIndex === 0) {
      // First section can be marked if chapter isn't completed yet
      return !progress.some(
        (p) => p.title === curriculum.chapters[chapterIndex].title
      );
    }

    // Check if previous section is completed
    const chapter = curriculum.chapters[chapterIndex];
    const prevSection = chapter.sections[sectionIndex - 1];
    return progress.some(
      (p) => p.title === `${chapter.title} - ${prevSection}`
    );
  };

  const markAsCompleted = async (chapterTitle, sectionText = null) => {
    try {
      const chapterIndex = subjectData.curriculum.chapters.findIndex(
        (ch) => ch.title === chapterTitle
      );

      const sectionIndex = sectionText
        ? subjectData.curriculum.chapters[chapterIndex].sections.indexOf(
            sectionText
          )
        : null;

      // Check if previous items are completed
      if (!isPreviousCompleted(chapterIndex, sectionIndex)) {
        let errorMessage = "";

        if (sectionText) {
          errorMessage = "Please complete the previous section first.";
        } else {
          const prevChapter = subjectData.curriculum.chapters[chapterIndex - 1];
          if (prevChapter.sections?.length > 0) {
            errorMessage = `Please complete all sections in ${prevChapter.title} first.`;
          } else {
            errorMessage = `Please complete ${prevChapter.title} first.`;
          }
        }

        await Swal.fire({
          icon: "error",
          title: "Cannot Mark as Completed",
          text: errorMessage,
          confirmButtonColor: "#3085d6",
        });
        return;
      }
      const today = new Date().toISOString();
      const itemTitle = sectionText
        ? `${chapterTitle} - ${sectionText}`
        : chapterTitle;

      // Vérifier si l'élément est déjà complété
      const isAlreadyCompleted = subjectData.progress?.some(
        (p) => p.title === itemTitle
      );

      if (isAlreadyCompleted) {
        await Swal.fire({
          icon: "info",
          title: "Already Completed",
          text: "This item is already marked as completed.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      const completedItem = {
        title: itemTitle,
        completedDate: today,
      };

      const result = await Swal.fire({
        title: "Mark as completed?",
        html: `
        <p>Are you sure you want to mark <strong>"${itemTitle}"</strong> as completed?</p>
        <div class="form-group mt-3">
          <label for="completion-date">Completion Date:</label>
          <input type="date" id="completion-date" class="form-control" value="${today.split("T")[0]}" />
        </div>
      `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        focusConfirm: false,
        preConfirm: () => {
          const dateInput = document.getElementById("completion-date").value;
          return {
            date: dateInput || today.split("T")[0],
          };
        },
      });

      if (result.isConfirmed) {
        // Mettre à jour la date avec celle sélectionnée par l'utilisateur
        completedItem.completedDate = new Date(result.value.date).toISOString();

        // Appeler le service pour mettre à jour la progression
        await updateSubjectProgress(subjectData._id, [completedItem]);

        // Mettre à jour l'état local
        setSubjectData((prev) => ({
          ...prev,
          progress: [...(prev.progress || []), completedItem],
        }));

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Marked as completed!",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
        });
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "Failed to update progress: " +
          (error.response?.data?.error || error.message),
      });
    }
  };

  const addSection = () => {
    if (sectionText.trim()) {
      setChapterSections([...chapterSections, sectionText.trim()]);
      setSectionText("");
    }
  };

  const addChapter = () => {
    if (chapterTitle.trim()) {
      const newChapter = {
        title: chapterTitle.trim(),
        sections: chapterSections,
      };
      setNewProp((prev) => ({
        ...prev,
        changes: {
          ...prev.changes,
          curriculum: {
            chapters: [...prev.changes.curriculum.chapters, newChapter],
          },
        },
      }));
      setChapterTitle("");
      setChapterSections([]);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Chapter added!",
        text: `${newChapter.title} with ${newChapter.sections.length} sections added to your proposition`,
        showConfirmButton: false,
        timer: 3000,
        toast: true,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const propositionData = {
        changes: newProp.changes,
        reason: newProp.reason,
        submittedBy: newProp.submittedBy,
      };

      // Submit the proposition
      const response = await addProposition(subjectData._id, propositionData);

      if (response && response.message === "Proposition added successfully.") {
        // Fetch the updated subject with all populated data
        const updatedSubject = await fetchSubjectById(subjectData._id);

        // Update local state with the fresh data
        setPropositions(updatedSubject.propositions || []);
        setSubjectData(updatedSubject);

        // Reset the form
        setNewProp({
          date: new Date().toISOString(),
          reason: "",
          submittedBy: currentUser?._id || "",
          validated: false,
          changes: {
            level: "",
            semester: "",
            curriculum: { chapters: [] },
          },
        });
        // Close the loading alert and show success alert
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Your proposition has been submitted successfully.",
          confirmButtonColor: "#3085d6",
        }).then(() => {
          onHide(); // Close the modal after user confirms the success message
        });
      } else {
        throw new Error("Failed to submit proposition");
      }
    } catch (error) {
      console.error("Error submitting proposition:", error);
      alert(
        "Failed to submit proposition: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{subjectData.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs defaultActiveKey="curriculum" className="mb-3">
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
                {subjectData.curriculum.chapters.map((chapter, index) => {
                  // Vérifie si le chapitre entier est complété
                  const isChapterCompleted = subjectData.progress?.some(
                    (p) => p.title === chapter.title && !p.title.includes("-")
                  );

                  return (
                    <ListGroup.Item
                      key={index}
                      className={isChapterCompleted ? "bg-light" : ""}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="fw-bold">
                          {chapter.title}
                          {isChapterCompleted && (
                            <Badge bg="success" className="ms-2">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant={
                            isChapterCompleted
                              ? "outline-secondary"
                              : "outline-success"
                          }
                          size="sm"
                          onClick={() => markAsCompleted(chapter.title)}
                          disabled={
                            isChapterCompleted || !isPreviousCompleted(index)
                          }
                        >
                          {isChapterCompleted ? (
                            <>
                              <i className="bi bi-check-circle me-1"></i>
                              Completed
                            </>
                          ) : (
                            "Mark Chapter Complete"
                          )}
                        </Button>
                      </div>
                      {chapter.sections && chapter.sections.length > 0 && (
                        <div className="ms-3 mt-2">
                          <h6>Sections:</h6>
                          <ul className="list-unstyled">
                            {chapter.sections.map((section, secIndex) => {
                              const isSectionCompleted =
                                subjectData.progress?.some(
                                  (p) =>
                                    p.title === `${chapter.title} - ${section}`
                                );

                              // Get completion date if section is completed
                              const completionDate = isSectionCompleted
                                ? new Date(
                                    subjectData.progress.find(
                                      (p) =>
                                        p.title ===
                                        `${chapter.title} - ${section}`
                                    ).completedDate
                                  ).toLocaleDateString()
                                : null;

                              return (
                                <li
                                  key={secIndex}
                                  className="d-flex justify-content-between align-items-center my-1 p-2 rounded"
                                  style={{
                                    backgroundColor: isSectionCompleted
                                      ? "#f8f9fa"
                                      : "transparent",
                                  }}
                                >
                                  <div>
                                    <span
                                      className={
                                        isSectionCompleted
                                          ? "text-decoration-line-through text-muted"
                                          : ""
                                      }
                                    >
                                      {section}
                                    </span>
                                    {isSectionCompleted && (
                                      <small className="text-success ms-2">
                                        (Completed on {completionDate})
                                      </small>
                                    )}
                                  </div>
                                  {!isSectionCompleted ? (
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() =>
                                        markAsCompleted(chapter.title, section)
                                      }
                                      disabled={
                                        !isPreviousCompleted(
                                          index,
                                          chapter.sections.indexOf(section)
                                        )
                                      }
                                    >
                                      Mark Complete
                                    </Button>
                                  ) : (
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
              {subjectData.evaluations && subjectData.evaluations.length > 0 ? (
                <ListGroup>
                  {subjectData.evaluations.map((evalItem, index) => (
                    <ListGroup.Item key={index}>
                      <div className="fw-bold">Score: {evalItem.score}/10</div>
                      <div className="mt-2">{evalItem.feedback}</div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-muted">No evaluations yet.</div>
              )}
            </div>
          </Tab>
          <Tab eventKey="propositions" title="Propositions">
            <div className="mt-3">
              <h5>Submit a New Proposition</h5>
              <Form
                onSubmit={handleSubmit}
                className="border p-4 rounded-3 bg-light"
              >
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group controlId="reason">
                      <Form.Label className="fw-bold">
                        Reason for Changes*
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Explain why these changes are needed..."
                        value={newProp.reason}
                        onChange={(e) =>
                          setNewProp({ ...newProp, reason: e.target.value })
                        }
                        required
                        minLength={20}
                      />
                      <Form.Text className="text-muted">
                        Minimum 20 characters required
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="level">
                      <Form.Label className="fw-bold">Level*</Form.Label>
                      <Form.Select
                        value={newProp.changes.level}
                        onChange={(e) =>
                          setNewProp({
                            ...newProp,
                            changes: {
                              ...newProp.changes,
                              level: e.target.value,
                            },
                          })
                        }
                        required
                      >
                        <option value="">Select level</option>
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="semester">
                      <Form.Label className="fw-bold">Semester*</Form.Label>
                      <Form.Select
                        value={newProp.changes.semester}
                        onChange={(e) =>
                          setNewProp({
                            ...newProp,
                            changes: {
                              ...newProp.changes,
                              semester: e.target.value,
                            },
                          })
                        }
                        required
                      >
                        <option value="">Select semester</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="border-top pt-3 mt-3">
                  <h6 className="fw-bold mb-3">Curriculum Changes</h6>

                  <div className="bg-white p-3 rounded border mb-3">
                    <Form.Group className="mb-3" controlId="chapterTitle">
                      <Form.Label>Chapter Title*</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter chapter title"
                        value={chapterTitle}
                        onChange={(e) => setChapterTitle(e.target.value)}
                        required={chapterSections.length > 0}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="sectionText">
                      <Form.Label>Add Section*</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="text"
                          placeholder="Enter section content"
                          value={sectionText}
                          onChange={(e) => setSectionText(e.target.value)}
                          required={chapterTitle.trim() !== ""}
                        />
                        <Button
                          variant="outline-primary"
                          onClick={addSection}
                          disabled={!sectionText.trim()}
                        >
                          Add Section
                        </Button>
                      </div>
                    </Form.Group>

                    {chapterSections.length > 0 && (
                      <div className="mt-2">
                        <h6 className="fs-6">Sections:</h6>
                        <ul className="list-group">
                          {chapterSections.map((s, idx) => (
                            <li
                              key={idx}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              {s}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  setChapterSections(
                                    chapterSections.filter((_, i) => i !== idx)
                                  )
                                }
                              >
                                ×
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="d-grid mt-3">
                      <Button
                        variant="success"
                        onClick={addChapter}
                        disabled={
                          !chapterTitle.trim() || chapterSections.length === 0
                        }
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Chapter to Proposition
                      </Button>
                    </div>
                  </div>

                  {newProp.changes.curriculum.chapters.length > 0 && (
                    <div className="mt-3">
                      <h6 className="fw-bold">Proposed Chapters</h6>
                      <div className="border rounded p-2 bg-white">
                        {newProp.changes.curriculum.chapters.map((ch, i) => (
                          <div key={i} className="mb-3 border-bottom pb-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <h6 className="mb-1">{ch.title}</h6>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  setNewProp((prev) => ({
                                    ...prev,
                                    changes: {
                                      ...prev.changes,
                                      curriculum: {
                                        chapters:
                                          prev.changes.curriculum.chapters.filter(
                                            (_, idx) => idx !== i
                                          ),
                                      },
                                    },
                                  }))
                                }
                              >
                                Remove
                              </Button>
                            </div>
                            <ul className="list-unstyled ms-3">
                              {ch.sections.map((s, si) => (
                                <li key={si} className="text-muted">
                                  • {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="d-grid mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={
                      newProp.changes.curriculum.chapters.length === 0 ||
                      !newProp.reason.trim()
                    }
                  >
                    Submit Proposition
                  </Button>
                </div>
              </Form>

              <hr className="my-4" />

              <div className="mt-4">
                <h5 className="fw-bold">Existing Propositions</h5>
                {propositions.length > 0 ? (
                  <div className="mt-3">
                    {propositions.map((prop, index) => (
                      <div key={index} className="card mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="card-title">
                                {new Date(prop.date).toLocaleDateString()} •
                                <span
                                  className={`badge ms-2 ${prop.validated ? "bg-success" : "bg-warning text-dark"}`}
                                >
                                  {prop.validated ? "Approved" : "Pending"}
                                </span>
                              </h6>
                              <p className="card-text">
                                <strong>Submitted by:</strong>{" "}
                                {prop.submittedBy?.firstName
                                  ? `${prop.submittedBy.firstName} ${prop.submittedBy.lastName}`
                                  : "Unknown user"}
                              </p>
                            </div>
                            <div>
                              <Badge bg="info" className="me-1">
                                Level: {prop.changes.level || "No change"}
                              </Badge>
                              <Badge bg="info">
                                Semester: {prop.changes.semester || "No change"}
                              </Badge>
                            </div>
                          </div>

                          <div className="mt-2">
                            <p className="mb-1">
                              <strong>Reason:</strong>
                            </p>
                            <p className="text-muted">{prop.reason}</p>
                          </div>

                          {prop.changes.curriculum?.chapters?.length > 0 && (
                            <div className="mt-3">
                              <p className="mb-1">
                                <strong>Proposed Changes:</strong>
                              </p>
                              <div className="border rounded p-2 bg-light">
                                {prop.changes.curriculum.chapters.map(
                                  (ch, i) => (
                                    <div key={i} className="mb-2">
                                      <h6 className="fs-6">
                                        Chapter: {ch.title}
                                      </h6>
                                      {ch.sections &&
                                        ch.sections.length > 0 && (
                                          <ul className="list-unstyled ms-3">
                                            {ch.sections.map((s, si) => (
                                              <li key={si}>• {s}</li>
                                            ))}
                                          </ul>
                                        )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-info mt-3">
                    No propositions submitted yet.
                  </div>
                )}
              </div>
            </div>
          </Tab>
          <Tab eventKey="history" title="History">
            <div className="mt-3">
              {subjectData.history && subjectData.history.length > 0 ? (
                <ListGroup>
                  {subjectData.history.map((entry, index) => (
                    <ListGroup.Item key={index}>
                      <div>
                        <strong>Date:</strong>{" "}
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Reason:</strong> {entry.reason || "N/A"}
                      </div>
                      <div className="mt-2">
                        <strong>Old Subject Info:</strong>
                        <ul>
                          {entry.oldSubject?.title && (
                            <li>Title: {entry.oldSubject.title}</li>
                          )}
                          {entry.oldSubject?.level && (
                            <li>Level: {entry.oldSubject.level}</li>
                          )}
                          {entry.oldSubject?.semester && (
                            <li>Semester: {entry.oldSubject.semester}</li>
                          )}
                          {entry.oldSubject?.curriculum?.chapters?.map(
                            (chapter, cIdx) => (
                              <li key={cIdx}>
                                Chapter: {chapter.title}
                                {chapter.sections &&
                                  chapter.sections.length > 0 && (
                                    <ul>
                                      {chapter.sections.map((section, sIdx) => (
                                        <li key={sIdx}>Section: {section}</li>
                                      ))}
                                    </ul>
                                  )}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-muted">
                  No history available for this subject.
                </div>
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
