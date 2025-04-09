/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner, Table, Row, Col } from "react-bootstrap";
import Select from "react-select";
import Swal from "sweetalert2";

import {
  getSubjects,
  deleteSubject,
  createSubject,
  updateSubject,
  getArchivedSubjects,
  publishUnpublishSubjects,
  getTeachers,
  getStudents,
  restoreSubject,
} from "../../../services/subjects.service";

const ITEMS_PER_PAGE = 5;

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [archivedSubjects, setArchivedSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState("active");

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  const [form, setForm] = useState({
    title: "",
    level: "",
    semester: "",
    curriculum: { chapters: [{ title: "", sections: [] }] },
    assignedTeacher: null,
    assignedStudent: [],
    year: new Date().getFullYear(),
  });

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [active, archived] = await Promise.all([
        getSubjects(),
        getArchivedSubjects(),
      ]);
      setSubjects(active || []);
      setArchivedSubjects(archived.archivedSubjects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const [t, s] = await Promise.all([getTeachers(), getStudents()]);
    setTeachers(t);
    setStudents(s);
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurriculumChange = (index, field, value) => {
    const updated = [...form.curriculum.chapters];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, curriculum: { chapters: updated } }));
  };

  const handleSectionChange = (chapterIndex, sectionIndex, value) => {
    const updated = [...form.curriculum.chapters];
    updated[chapterIndex].sections[sectionIndex] = value;
    setForm((prev) => ({ ...prev, curriculum: { chapters: updated } }));
  };

  const addChapter = () => {
    setForm((prev) => ({
      ...prev,
      curriculum: {
        chapters: [...prev.curriculum.chapters, { title: "", sections: [] }],
      },
    }));
  };

  const addSection = (chapterIndex) => {
    const updated = [...form.curriculum.chapters];
    updated[chapterIndex].sections.push("");
    setForm((prev) => ({ ...prev, curriculum: { chapters: updated } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      assignedTeacher: form.assignedTeacher?.value || null,
      assignedStudent: form.assignedStudent.map((s) => s.value),
    };

    try {
      if (editingSubject) {
        await updateSubject(editingSubject._id, payload);
      } else {
        await createSubject(payload);
      }

      setShowModal(false);
      setEditingSubject(null);
      resetForm();
      fetchData();

      Swal.fire(
        "Success",
        `Subject ${editingSubject ? "updated" : "created"} successfully.`,
        "success"
      );
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Operation failed.";

      // Custom error for duplicate title
      if (errorMessage.includes("already exists")) {
        Swal.fire({
          icon: "warning",
          title: "Duplicate Subject",
          text: "Subject already exists. You can restore it from archived subjects.",
        });
      } else {
        Swal.fire("Error", errorMessage, "error");
      }
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      level: "",
      semester: "",
      curriculum: { chapters: [{ title: "", sections: [] }] },
      assignedTeacher: null,
      assignedStudent: [],
      year: new Date().getFullYear(),
    });
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setForm({
      title: subject.title,
      level: subject.level,
      semester: subject.semester,
      curriculum: subject.curriculum || { chapters: [] },
      assignedTeacher: subject.assignedTeacher
        ? {
            label: `${subject.assignedTeacher.firstName} ${subject.assignedTeacher.lastName}`,
            value: subject.assignedTeacher._id,
          }
        : null,
      assignedStudent:
        subject.assignedStudent?.map((s) => ({
          label: `${s.firstName} ${s.lastName}`,
          value: s._id,
        })) || [],
      year: subject.year || new Date().getFullYear(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this subject?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteSubject(id);
        await fetchData();
        Swal.fire("Deleted!", "Subject deleted successfully.", "success");
      } catch (err) {
        const msg = err.response?.data?.message || "Delete failed";

        if (
          msg.toLowerCase().includes("linked") ||
          msg.toLowerCase().includes("assigned")
        ) {
          const archiveConfirm = await Swal.fire({
            title: "Cannot Delete",
            text: "This subject is linked to a teacher. Archive instead?",
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Yes, archive",
          });

          if (archiveConfirm.isConfirmed) {
            try {
              await deleteSubject(id, true);
              await fetchData();
              Swal.fire(
                "Archived!",
                "Subject archived instead of deleted.",
                "success"
              );
            } catch (archiveErr) {
              Swal.fire(
                "Error",
                archiveErr.response?.data?.message || "Archive failed.",
                "error"
              );
            }
          }
        } else {
          Swal.fire("Error", msg, "error");
        }
      }
    }
  };

  const handleTogglePublish = async (publish) => {
    try {
      await publishUnpublishSubjects(publish ? "publish" : "unpublish");
      await fetchData();
      Swal.fire(
        "Success",
        `Subjects have been ${publish ? "published" : "unpublished"} successfully.`,
        "success"
      );
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to update publish status.",
        "error"
      );
    }
  };

  // const handleToggleIndividualPublish = async (subject) => {
  //   const newStatus = !subject.isPublished;
  //   try {
  //     await publishUnpublishSubjects(newStatus ? "publish" : "unpublish");
  //     await fetchData();
  //     Swal.fire(
  //       "Success",
  //       `Subject ${newStatus ? "published" : "hidden"} successfully.`,
  //       "success"
  //     );
  //   } catch (err) {
  //     Swal.fire(
  //       "Error",
  //       err.response?.data?.message || "Action failed.",
  //       "error"
  //     );
  //   }
  // };

  const handleRestore = async (id) => {
    try {
      const shouldPublish = !subjects
        .filter((s) => !s.isArchived)
        .some((s) => !s.isPublished); // matches global publish state
  
      await restoreSubject(id, shouldPublish);
      fetchData();
      Swal.fire("Restored!", "Subject has been restored.", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Restore failed.", "error");
    }
  };
  

  const filtered = (
    tab === "active"
      ? subjects.filter((s) => !s.isArchived) // hide archived from active
      : archivedSubjects
  ).filter((s) => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const pageCount = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderPagination = () => {
    const pages = [];
    const visiblePages = 3;
    const startPage = Math.max(1, currentPage - visiblePages);
    const endPage = Math.min(pageCount, currentPage + visiblePages);

    if (currentPage > 1) {
      pages.push(
        <Button key="first" size="sm" onClick={() => setCurrentPage(1)}>
          {"<<"}
        </Button>,
        <Button
          key="prev"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          {"<"}
        </Button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "primary" : "outline-secondary"}
          size="sm"
          className="me-1"
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Button>
      );
    }

    if (currentPage < pageCount) {
      pages.push(
        <Button
          key="next"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          {">"}
        </Button>,
        <Button key="last" size="sm" onClick={() => setCurrentPage(pageCount)}>
          {">>"}
        </Button>
      );
    }

    return (
      <div className="d-flex justify-content-center mt-3 flex-wrap gap-1">
        {pages}
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="mb-3" style={{ background: "#fff", padding: "1rem" }}>
        <div className="d-flex gap-4">
          <button
            className={`btn ${tab === "active" ? "btn-primary shadow" : "btn-link text-primary"}`}
            onClick={() => setTab("active")}
          >
            Active Subjects
          </button>
          <button
            className={`btn ${tab === "archived" ? "btn-primary shadow" : "btn-link text-primary"}`}
            onClick={() => setTab("archived")}
          >
            Archived Subjects
          </button>
        </div>
      </div>

      {/* Search and Add */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Control
          placeholder="Search by subject title"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{ maxWidth: "300px" }}
        />
        <div className="d-flex gap-2">
          {tab === "active" && (
            <>
              <Button
                variant="info"
                onClick={() => {
                  setEditingSubject(null);
                  resetForm();
                  setShowModal(true);
                }}
              >
                + Add Subject
              </Button>
              <Button
                variant={
                  subjects.some((s) => !s.isPublished) ? "secondary" : "dark"
                }
                disabled={subjects.filter((s) => !s.isArchived).length === 0}
                onClick={() =>
                  handleTogglePublish(
                    subjects
                      .filter((s) => !s.isArchived)
                      .some((s) => !s.isPublished)
                  )
                }
              >
                {subjects
                  .filter((s) => !s.isArchived)
                  .some((s) => !s.isPublished)
                  ? "📢 Publish All"
                  : "🙈 Unpublish All"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <Table bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Level</th>
                  <th>Semester</th>
                  <th>Year</th>
                  <th>Teacher</th>
                  <th>Students</th>
                  <th>Curriculum</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((subject, index) => (
                  <tr key={subject._id}>
                    <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td>{subject.title}</td>
                    <td>{subject.level}</td>
                    <td>{subject.semester}</td>
                    <td>{subject.year}</td>
                    <td>
                      {subject.assignedTeacher
                        ? `${subject.assignedTeacher.firstName} ${subject.assignedTeacher.lastName}`
                        : "-"}
                    </td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => {
                          setSelectedStudents(subject.assignedStudent || []);
                          setShowStudentsModal(true);
                        }}
                      >
                        View ({subject.assignedStudent?.length || 0})
                      </Button>
                    </td>

                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedCurriculum(subject.curriculum);
                          setShowCurriculumModal(true);
                        }}
                      >
                        View ({subject.curriculum?.chapters?.length || 0})
                      </Button>
                    </td>

                    <td>
                      {tab === "active" ? (
                        <>
                          <Button
                            variant="warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(subject)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              handleDelete(
                                subject._id,
                                !!subject.assignedTeacher
                              )
                            }
                          >
                            Delete
                          </Button>
                          {/* <Button
                            variant={
                              subject.isPublished ? "primary" : "secondary"
                            }
                            size="sm"
                            onClick={() =>
                              handleToggleIndividualPublish(subject)
                            }
                          >
                            {subject.isPublished ? "Unpublish" : "Publish"}
                          </Button> */}
                        </>
                      ) : (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleRestore(subject._id)}
                        >
                          Restore
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {pageCount > 1 && renderPagination()}
        </>
      )}

      {/* Student Modal */}
      <Modal
        show={showStudentsModal}
        onHide={() => setShowStudentsModal(false)}
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Assigned Students</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudents.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudents
                      .slice((currentPage - 1) * 5, currentPage * 5)
                      .map((s, i) => (
                        <tr key={i}>
                          <td>{(currentPage - 1) * 5 + i + 1}</td>
                          <td>{s.firstName}</td>
                          <td>{s.lastName}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {selectedStudents.length > 5 && (
                <div className="d-flex justify-content-center mt-2">
                  {[...Array(Math.ceil(selectedStudents.length / 5))].map(
                    (_, i) => (
                      <Button
                        key={i}
                        size="sm"
                        variant={
                          currentPage === i + 1
                            ? "primary"
                            : "outline-secondary"
                        }
                        className="me-1"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    )
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-muted">No students assigned.</p>
          )}
        </Modal.Body>
      </Modal>

      {/* Curriculum Modal */}
      <Modal
        show={showCurriculumModal}
        onHide={() => setShowCurriculumModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Curriculum Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCurriculum?.chapters?.length > 0 ? (
            <div className="px-1">
              {selectedCurriculum.chapters.map((ch, i) => (
                <div key={i} className="mb-2 border rounded bg-light p-2">
                  <h6
                    className="text-primary mb-2"
                    style={{ fontSize: "0.95rem" }}
                  >
                    📘 Chapter {i + 1}:{" "}
                    <span className="fw-normal">{ch.title}</span>
                  </h6>
                  {ch.sections?.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {ch.sections.map((sec, j) => (
                        <li
                          key={j}
                          className="list-group-item py-1 px-2"
                          style={{ fontSize: "0.9rem" }}
                        >
                          🔹 Section {j + 1}: {sec}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0 ps-2">No sections.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No curriculum defined.</p>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingSubject ? "Edit Subject" : "Add Subject"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                name="title"
                value={form.title}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Level</Form.Label>
                  <Form.Control
                    name="level"
                    value={form.level}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Semester</Form.Label>
                  <Form.Control
                    name="semester"
                    value={form.semester}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="year"
                    value={form.year}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Assigned Teacher</Form.Label>
              <Select
                options={teachers.map((t) => ({
                  label: `${t.firstName} ${t.lastName}`,
                  value: t._id,
                }))}
                value={form.assignedTeacher}
                onChange={(selected) =>
                  setForm((prev) => ({ ...prev, assignedTeacher: selected }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Assigned Students</Form.Label>
              <Select
                isMulti
                options={students.map((s) => ({
                  label: `${s.firstName} ${s.lastName}`,
                  value: s._id,
                }))}
                value={form.assignedStudent}
                onChange={(selected) =>
                  setForm((prev) => ({ ...prev, assignedStudent: selected }))
                }
              />
            </Form.Group>

            <Form.Label>Curriculum</Form.Label>
            {form.curriculum.chapters.map((chapter, i) => (
              <div key={i} className="mb-3 p-2 border rounded">
                <Form.Group className="mb-2">
                  <Form.Label>Chapter Title</Form.Label>
                  <Form.Control
                    value={chapter.title}
                    onChange={(e) =>
                      handleCurriculumChange(i, "title", e.target.value)
                    }
                    required
                  />
                </Form.Group>
                <Form.Label>Sections</Form.Label>
                {chapter.sections.map((sec, j) => (
                  <Form.Control
                    key={j}
                    className="mb-1"
                    value={sec}
                    onChange={(e) => handleSectionChange(i, j, e.target.value)}
                  />
                ))}
                <Button size="sm" variant="link" onClick={() => addSection(i)}>
                  + Add Section
                </Button>
              </div>
            ))}
            <Button size="sm" variant="link" onClick={addChapter}>
              + Add Chapter
            </Button>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={
                !form.title.trim() ||
                !form.level.trim() ||
                !form.semester.trim() ||
                form.curriculum.chapters.length < 1 ||
                !form.curriculum.chapters[0].title.trim() ||
                form.curriculum.chapters[0].sections.length < 1 ||
                !form.curriculum.chapters[0].sections[0].trim()
              }
            >
              {editingSubject ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageSubjects;
