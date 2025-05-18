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
  getSubjectDetails,
  validateProposition,
  fetchStudentsByLevelAndOption,
  sendEvaluationEmailsToStudents,
  getSubjectEvaluations,
  getSubjectHistory,
} from "../../../services/subjects.service";
import { fetchAvailableYears } from "../../../services/saison";
import { useAuth } from "../../../contexts/AuthContext";

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
  const [subjectDetailsModal, setSubjectDetailsModal] = useState(false);
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const { user } = useAuth();
  const [availableYears, setAvailableYears] = useState([]);
  const [latestYear, setLatestYear] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [subjectHistory, setSubjectHistory] = useState([]);
  const [filterTeacher, setFilterTeacher] = useState(null);
  const [filterLevel, setFilterLevel] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showEvaluationsModal, setShowEvaluationsModal] = useState(false);
  const [evaluationsData, setEvaluationsData] = useState([]);
  const [evaluationPage, setEvaluationPage] = useState(1);
  const EVALS_PER_PAGE = 5;

  const levelOptions = [
    { value: 1, label: "1st" },
    { value: 2, label: "2nd" },
    { value: 3, label: "3rd" },
  ];
  const optionOptions = [
    { value: "inLog", label: "INLOG" },
    { value: "inRev", label: "INREV" },
  ];
  const activeSubjects = subjects.filter((s) => !s.isArchived);
  const hasActiveSubjects = activeSubjects.length > 0;
  const [form, setForm] = useState({
    title: "",
    level: null,
    option: null, // NEW
    semester: "",
    curriculum: { chapters: [{ title: "", sections: [] }] },
    assignedTeacher: null,
    assignedStudent: [],
    year: selectedYear || new Date().getFullYear(),
  });

const fetchData = async (yearToUse) => {
  setLoading(true);
  try {
    const filters = { year: yearToUse };

    // Fetch active subjects and archived subjects separately
    const [active, archivedRaw] = await Promise.all([
      getSubjects(filters), // Active subjects for the selected year
      getArchivedSubjects(filters), // Archived subjects for the selected year
    ]);

    // Clean the archived data if it exists
    const cleanedArchived = Array.isArray(archivedRaw)
      ? archivedRaw
      : archivedRaw.archivedSubjects || [];

    // Set subjects correctly based on isArchived flag
    const activeSubjects = active.filter((subject) => !subject.isArchived);
    setSubjects(activeSubjects); // Set active subjects correctly

    // Set archived subjects correctly
    setArchivedSubjects(cleanedArchived); 

    // Fetch subject history for previous years if year is different from current year
    if (yearToUse !== new Date().getFullYear()) {
      const subjectHistory = await getSubjectHistory(yearToUse);
      if (subjectHistory && subjectHistory.archivedSubjects) {
        setSubjectHistory(subjectHistory.archivedSubjects); // Store historical data in state
      }
    }
  } catch (err) {
    console.error("Failed to fetch subject data:", err);
    Swal.fire("Error", "Failed to load subjects.", "error");
  } finally {
    setLoading(false);
    setCurrentPage(1);
  }
};

  // Inside your component or where you're handling the year change
  const fetchSubjectHistory = async (selectedYear) => {
    try {
      const response = await getSubjectHistory(selectedYear); // Fetch data for the selected year
      console.log("Subject History Response:", response);
      // Update the state with the fetched data
      setSubjectHistory(response.archivedSubjects); // assuming response contains 'archivedSubjects'
    } catch (error) {
      console.error("Error fetching subject history:", error);
    }
  };

  // Call fetchSubjectHistory when the year changes
  useEffect(() => {
    if (selectedYear) {
      fetchSubjectHistory(selectedYear); // Fetch history for the selected year
    }
  }, [selectedYear]);

  useEffect(() => {
    const loadYears = async () => {
      const token = localStorage.getItem("token");
      const response = await fetchAvailableYears(token);

      const nowYear = new Date().getFullYear();
      // If API gives you a non‐empty array, use that.
      // Otherwise fall back to [nowYear].
      const yearsArray =
        Array.isArray(response) && response.length > 0 ? response : [nowYear];

      setAvailableYears(yearsArray);

      // latestYear is always the max of the academic years
      const latest = Math.max(...yearsArray);
      setLatestYear(latest);
      setSelectedYear(latest);

      fetchData(latest);
    };

    loadYears();
  }, []);

  const fetchUsers = async () => {
    const [t] = await Promise.all([getTeachers(), getStudents()]);
    setTeachers(t);
    // setStudents(s);
  };
  useEffect(() => {
    if (selectedYear !== null) {
      setForm((f) => ({ ...f, year: selectedYear }));
    }
  }, [selectedYear]);
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleViewDetails = async (id) => {
    try {
      const res = await getSubjectDetails(id);
      setSubjectDetails(res.subject);
      setSubjectDetailsModal(true);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch subject details", "error");
    }
  };

  const handleCurriculumChange = (index, field, value) => {
    const updated = [...form.curriculum.chapters];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, curriculum: { chapters: updated } }));
  };

  const handleViewEvaluations = async (subjectId) => {
    try {
      const res = await getSubjectEvaluations(subjectId);
      if (!res.evaluations.length) {
        return Swal.fire("Info", "No evaluations available.", "info");
      }
      setEvaluationsData(res.evaluations);
      setEvaluationPage(1);
      setShowEvaluationsModal(true);
    } catch (err) {
      Swal.fire("Error", "Failed to load evaluations.", "error");
    }
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
      level: String(form.level?.value || ""),
      semester: form.semester || "",
      option: form.option?.value || null,
      assignedTeacher: form.assignedTeacher?.value || null,
      assignedStudent: form.assignedStudent.map((s) => s.value),
      year: form.year,
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
      fetchData(selectedYear);

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
  const handleValidateProposition = async (id) => {
    const confirm = await Swal.fire({
      title: "Validate Proposition?",
      text: "This will apply the proposed changes and move the current version to history.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Validate",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        await validateProposition(id); // calls subject.service.js
        await fetchData(selectedYear); // refresh list after validation
        Swal.fire("Success", "Proposition has been validated.", "success");
      } catch (err) {
        Swal.fire(
          "Error",
          err.response?.data?.error || "Validation failed.",
          "error"
        );
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
      year: selectedYear || new Date().getFullYear(), // Fallback in case selectedYear is not set
    });
  };

  const fetchStudentsAutoFill = async (level, option = null) => {
    try {
      const students = await fetchStudentsByLevelAndOption(level, option);
      const options = students.map((s) => ({
        label: `${s.firstName} ${s.lastName}`,
        value: s._id,
      }));
      setFilteredStudents(options);
      setForm((prev) => ({
        ...prev,
        assignedStudent: options, // auto-fill
      }));
    } catch (err) {
      console.error("Failed to auto-fill students", err);
      Swal.fire("Error", "Failed to auto-load students", "error");
    }
  };

  const handleEdit = (subject) => {
    const levelOptions = [
      { value: "1", label: "1st" },
      { value: "2", label: "2nd" },
      { value: "3", label: "3rd" },
    ];
    const optionOptions = [
      { value: "inLog", label: "INLOG" },
      { value: "inRev", label: "INREV" },
    ];

    const matchedLevel = levelOptions.find(
      (opt) => opt.value === String(subject.level)
    );
    const matchedOption = optionOptions.find(
      (opt) => opt.value === subject.option
    );

    setEditingSubject(subject);
    setForm({
      title: subject.title,
      level: matchedLevel || null,
      option: matchedOption || null,
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

    // Preload students
    if (subject.level === "1") {
      fetchStudentsAutoFill("1");
    } else if (
      (subject.level === "2" || subject.level === "3") &&
      subject.option
    ) {
      fetchStudentsAutoFill(subject.level, subject.option);
    }

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
        await fetchData(selectedYear);
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
              await fetchData(selectedYear);
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
  const handleSendEvaluationEmails = async () => {
    const activeSubjects = subjects.filter((s) => !s.isArchived);

    // Check if all active subjects are published
    const allPublished = activeSubjects.every((s) => s.isPublished);

    if (!allPublished) {
      Swal.fire({
        icon: "warning",
        title: "Unpublished Subjects",
        text: "Please publish all active subjects before sending evaluation emails.",
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "Send Evaluation Emails?",
      text: "This will send evaluation email notifications to students for all active subjects.",
      showCancelButton: true,
      confirmButtonText: "Yes, Send",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    // Show loading
    Swal.fire({
      title: "Sending emails...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await sendEvaluationEmailsToStudents();
      Swal.fire("Success", "Evaluation emails sent to students.", "success");
    } catch (err) {
      const message = err.response?.data?.error || "Failed to send emails.";
      Swal.fire("Error", message, "error");
    }
  };

  const handleTogglePublish = async (publish) => {
    try {
      await publishUnpublishSubjects(publish ? "publish" : "unpublish");
      await fetchData(selectedYear);
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
      fetchData(selectedYear);
      Swal.fire("Restored!", "Subject has been restored.", "success");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Restore failed.",
        "error"
      );
    }
  };

const isHistoryYear = selectedYear !== null && selectedYear !== latestYear;

// Render the filtered and paginated subjects
let entries;
if (tab === "active") {
  entries = subjects; // Active subjects for the selected year
} else if (tab === "archived") {
  entries = archivedSubjects; // Archived subjects for the selected year
} else {
  // For propositions and evaluations, check if it's history year
  entries = isHistoryYear ? archivedSubjects : subjects;
}

const baseSubjects = entries;

// Filter and paginate the subjects based on selected filters
const filtered = baseSubjects
  .filter((s) => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
  .filter((s) =>
    filterTeacher ? s.assignedTeacher?._id === filterTeacher.value : true
  )
  .filter((s) => (filterLevel ? s.level === filterLevel : true))
  .filter((s) => (filterSemester ? s.semester === filterSemester : true));

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

  const propositionSubjects = subjects.filter(
    (s) => s.propositions?.length > 0
  );

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
          <div className="position-relative d-inline-block">
            <button
              className={`btn ${tab === "propositions" ? "btn-primary shadow" : "btn-link text-primary"}`}
              onClick={() => setTab("propositions")}
            >
              Propositions
            </button>
            {subjects.filter((s) => s.propositions?.length > 0).length > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "0.6rem" }}
              >
                {subjects.filter((s) => s.propositions?.length > 0).length}
              </span>
            )}
          </div>
          {(user.role === "admin" ||
            subjects.some((s) => s.assignedTeacher?._id === user._id)) && (
            <button
              className={`btn ${tab === "evaluations" ? "btn-primary shadow" : "btn-link text-primary"}`}
              onClick={() => setTab("evaluations")}
            >
              Evaluations
            </button>
          )}
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
                disabled={isHistoryYear}
              >
                + Add Subject
              </Button>
              <Button
                variant={
                  activeSubjects.some((s) => !s.isPublished)
                    ? "secondary"
                    : "dark"
                }
                disabled={!hasActiveSubjects || isHistoryYear}
                onClick={() =>
                  handleTogglePublish(
                    activeSubjects.some((s) => !s.isPublished)
                  )
                }
              >
                {activeSubjects.some((s) => !s.isPublished)
                  ? "📢 Publish All"
                  : "🙈 Unpublish All"}
              </Button>

              <Button
                variant="success"
                className="ms-2"
                onClick={handleSendEvaluationEmails}
                disabled={!hasActiveSubjects || isHistoryYear}
              >
                📧 Send Evaluation Emails
              </Button>
            </>
          )}
        </div>
      </div>

      <Row className="mb-3">
        <Col md={3}>
          {!isHistoryYear && (
            <Select
              options={baseSubjects
                .filter((s) => s.assignedTeacher)
                .map((s) => s.assignedTeacher)
                .filter(
                  (t, i, arr) => arr.findIndex((x) => x._id === t._id) === i
                ) // remove duplicates
                .map((t) => ({
                  label: `${t.firstName} ${t.lastName}`,
                  value: t._id,
                }))}
              isClearable
              placeholder="Filter by Teacher"
              value={filterTeacher}
              onChange={setFilterTeacher}
            />
          )}
        </Col>

        <Col md={3}>
          {!isHistoryYear && (
            <Select
              options={[...new Set(baseSubjects.map((s) => s.level))].map(
                (level) => ({
                  label: `Level ${level}`,
                  value: level,
                })
              )}
              isClearable
              placeholder="Filter by Level"
              value={
                filterLevel
                  ? { value: filterLevel, label: `Level ${filterLevel}` }
                  : null
              }
              onChange={(selected) => setFilterLevel(selected?.value || "")}
            />
          )}
        </Col>

        <Col md={3}>
          {!isHistoryYear && (
            <Select
              options={[...new Set(baseSubjects.map((s) => s.semester))].map(
                (sem) => ({
                  label: sem,
                  value: sem,
                })
              )}
              isClearable
              placeholder="Filter by Semester"
              value={
                filterSemester
                  ? { value: filterSemester, label: filterSemester }
                  : null
              }
              onChange={(selected) => setFilterSemester(selected?.value || "")}
            />
          )}
        </Col>

        <Col md={3}>
          <Select
            options={availableYears.map((year) => ({
              label: year.toString(),
              value: year,
            }))}
            isClearable
            placeholder="Select Year"
            value={
              selectedYear !== null
                ? { value: selectedYear, label: selectedYear.toString() }
                : null
            }
            onChange={(selectedOption) => {
              const newYear = selectedOption?.value ?? null;
              setSelectedYear(newYear); // Update the selected year state
              if (newYear !== null) {
                fetchData(newYear); // Fetch data for the selected year
              }
            }}
          />
        </Col>
      </Row>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : tab === "propositions" ? (
        <div className="table-responsive mt-3">
          <Table bordered hover>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Current Level</th>
                <th>Proposed Level</th>
                <th>Current Semester</th>
                <th>Proposed Semester</th>
                <th>Reason</th>
                <th>Submitted By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {propositionSubjects.map((subject) => {
                const latest =
                  subject.propositions[subject.propositions.length - 1];
                const submittedBy = latest?.submittedBy;

                return (
                  <tr key={subject._id}>
                    <td>
                      {subject.title}
                      {(user.role === "admin" ||
                        subject.assignedTeacher?._id === user._id) &&
                        subject.evaluations?.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline-dark"
                            className="ms-2"
                            onClick={() => handleViewEvaluations(subject._id)}
                          >
                            📊
                          </Button>
                        )}
                    </td>
                    <td>{subject.level}</td>
                    <td>{latest?.changes?.level || "-"}</td>
                    <td>{subject.semester}</td>
                    <td>{latest?.changes?.semester || "-"}</td>
                    <td>
                      {latest?.reason || (
                        <i className="text-muted">No reason</i>
                      )}
                    </td>
                    <td>
                      {submittedBy ? (
                        `${submittedBy.firstName} ${submittedBy.lastName}`
                      ) : (
                        <i className="text-muted">Unknown</i>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleValidateProposition(subject._id)}
                      >
                        Validate
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      ) : tab === "evaluations" ? (
        <div className="table-responsive mt-3">
          <Table bordered hover>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Teacher</th>
                <th># of Evaluations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects
                .filter(
                  (s) =>
                    s.evaluations?.length > 0 &&
                    (user.role === "admin" ||
                      s.assignedTeacher?._id === user._id)
                )
                .map((s) => (
                  <tr key={s._id}>
                    <td>{s.title}</td>
                    <td>
                      {s.assignedTeacher
                        ? `${s.assignedTeacher.firstName} ${s.assignedTeacher.lastName}`
                        : "-"}
                    </td>
                    <td>{s.evaluations.length}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewEvaluations(s._id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <Table bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Subject Name</th>
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
                          <Button
                            variant="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleViewDetails(subject._id)}
                          >
                            Details
                          </Button>
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

                {/* Subject History Display */}
                {subjectHistory.map((history, index) => (
                  <tr key={history._id}>
                    <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td>{history.title}</td>
                    <td>{history.level}</td>
                    <td>{history.semester}</td>
                    <td>{history.year}</td>
                    <td>
                      {history.assignedTeacher
                        ? `${history.assignedTeacher.firstName} ${history.assignedTeacher.lastName}`
                        : "-"}
                    </td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => {
                          setSelectedStudents(history.assignedStudent || []);
                          setShowStudentsModal(true);
                        }}
                      >
                        View ({history.assignedStudent?.length || 0})
                      </Button>
                    </td>

                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedCurriculum(history.curriculum);
                          setShowCurriculumModal(true);
                        }}
                      >
                        View ({history.curriculum?.chapters?.length || 0})
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
                            disabled={isHistoryYear}
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
                            disabled={isHistoryYear}
                          >
                            Delete
                          </Button>
                          <Button
                            variant="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleViewDetails(subject._id)}
                            disabled={isHistoryYear}
                          >
                            Details
                          </Button>
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
      <Modal
        show={subjectDetailsModal}
        onHide={() => setSubjectDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Subject Details & History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {subjectDetails ? (
            <>
              <h5 className="mb-2">📘 {subjectDetails.title}</h5>
              <p>
                <strong>Level:</strong> {subjectDetails.level} <br />
                <strong>Semester:</strong> {subjectDetails.semester}
              </p>

              <hr />
              <h6>📚 Curriculum</h6>
              {subjectDetails.curriculum?.chapters?.map((ch, i) => (
                <div key={i} className="mb-2 border rounded bg-light p-2">
                  <strong>Chapter {i + 1}:</strong> {ch.title}
                  <ul className="mt-1">
                    {ch.sections?.map((s, j) => (
                      <li key={j}>🔹 {s}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <hr />
              <h6>🕘 Modification History</h6>
              {subjectDetails.history?.length > 0 ? (
                subjectDetails.history
                  .slice()
                  .reverse()
                  .map((entry, i) => (
                    <div
                      key={i}
                      className="mb-2 p-2 bg-white shadow-sm border rounded"
                    >
                      <p className="mb-1">
                        <strong>Date:</strong>{" "}
                        {new Date(entry.date).toLocaleDateString()} <br />
                        <strong>Modified By:</strong>{" "}
                        {entry.submittedBy
                          ? `${entry.submittedBy.firstName} ${entry.submittedBy.lastName}`
                          : "Admin"}{" "}
                        <br />
                        <strong>Reason:</strong>{" "}
                        {entry.reason || "No reason provided"}
                      </p>
                      <div className="ps-3">
                        <p className="fw-bold">Previous State:</p>
                        <ul style={{ fontSize: "0.9rem" }}>
                          {entry.oldSubject?.title && (
                            <li>Title: {entry.oldSubject.title}</li>
                          )}
                          {entry.oldSubject?.level && (
                            <li>Level: {entry.oldSubject.level}</li>
                          )}
                          {entry.oldSubject?.semester && (
                            <li>Semester: {entry.oldSubject.semester}</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-muted">No history recorded.</p>
              )}
            </>
          ) : (
            <Spinner animation="border" />
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showEvaluationsModal}
        onHide={() => setShowEvaluationsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>📊 Student Evaluations</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {evaluationsData.length === 0 ? (
            <p>No evaluations found.</p>
          ) : (
            <>
              {evaluationsData
                .slice(
                  (evaluationPage - 1) * EVALS_PER_PAGE,
                  evaluationPage * EVALS_PER_PAGE
                )
                .map((ev, idx) => (
                  <div
                    key={idx}
                    className="mb-3 p-3 border rounded bg-light shadow-sm"
                  >
                    <div className="fw-bold mb-2">
                      Evaluation #
                      {(evaluationPage - 1) * EVALS_PER_PAGE + idx + 1}
                    </div>
                    {/* <div>
                      <strong>Score:</strong>{" "}
                      <span
                        style={{
                          color:
                            ev.score < 3
                              ? "red"
                              : ev.score < 6
                                ? "orange"
                                : "green",
                          fontWeight: "bold",
                        }}
                      >
                        {ev.score} / 10
                      </span>
                    </div> */}
                    <div>
                      <strong>Score:</strong>{" "}
                      <span
                        className={`badge ${
                          ev.score < 3
                            ? "bg-danger"
                            : ev.score < 6
                              ? "bg-warning text-dark"
                              : "bg-success"
                        }`}
                        style={{ fontSize: "0.6rem" }}
                      >
                        {ev.score} / 10
                      </span>
                    </div>
                    <div>
                      <strong>Feedback:</strong>
                      <br />
                      <em>{ev.feedback}</em>
                    </div>
                  </div>
                ))}

              {evaluationsData.length > EVALS_PER_PAGE && (
                <div className="d-flex justify-content-center mt-3">
                  <ul className="pagination mb-0">
                    <li
                      className={`page-item ${evaluationPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setEvaluationPage((p) => p - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from(
                      {
                        length: Math.ceil(
                          evaluationsData.length / EVALS_PER_PAGE
                        ),
                      },
                      (_, i) => (
                        <li
                          key={i}
                          className={`page-item ${evaluationPage === i + 1 ? "active" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setEvaluationPage(i + 1)}
                          >
                            {i + 1}
                          </button>
                        </li>
                      )
                    )}
                    <li
                      className={`page-item ${evaluationPage === Math.ceil(evaluationsData.length / EVALS_PER_PAGE) ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setEvaluationPage((p) => p + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEvaluationsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingSubject ? "Edit Subject" : "Add Subject"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          {/* <Form.Control  name="year" value={form.year} /> */}
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
                  <Select
                    options={levelOptions}
                    value={form.level}
                    onChange={(selected) => {
                      const lvl = selected?.value;
                      setForm((prev) => ({
                        ...prev,
                        level: selected,
                        option: null,
                        assignedStudent: [],
                      }));
                      setFilteredStudents([]);
                      if (lvl === 1) {
                        fetchStudentsAutoFill(1, null);
                      }
                    }}
                    isClearable
                  />
                </Form.Group>

                {((form.level?.value === 2 &&
                  form.semester === "2nd Semester") ||
                  form.level?.value === 3) && (
                  <Form.Group className="mb-3">
                    <Form.Label>Option</Form.Label>
                    <Select
                      options={optionOptions}
                      value={form.option}
                      onChange={(selected) => {
                        const lvl = form.level.value;
                        const opt = selected.value;
                        setForm((f) => ({
                          ...f,
                          option: selected,
                          assignedStudent: [],
                        }));
                        if (lvl && opt) fetchStudentsAutoFill(lvl, opt);
                      }}
                      isClearable
                    />
                    {!form.option && (
                      <small className="text-muted">
                        Please select an option to load students.
                      </small>
                    )}
                  </Form.Group>
                )}
              </Col>

              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Semester</Form.Label>
                  <Select
                    options={[
                      { value: "1st Semester", label: "1st Semester" },
                      { value: "2nd Semester", label: "2nd Semester" },
                    ]}
                    value={
                      form.semester
                        ? { value: form.semester, label: form.semester }
                        : null
                    }
                    onChange={(selected) =>
                      setForm((prev) => ({
                        ...prev,
                        semester: selected?.value || "",
                      }))
                    }
                    isClearable
                  />
                </Form.Group>
              </Col>

              {/* <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Assigned Students</Form.Label>
                  <Select
                    isMulti
                    isDisabled={
                      !form.level?.value ||
                      (form.level?.value > 1 && !form.option?.value)
                    }
                    options={filteredStudents}
                    value={form.assignedStudent}
                    onChange={(selected) =>
                      setForm((prev) => ({
                        ...prev,
                        assignedStudent: selected,
                      }))
                    }
                  />
                </Form.Group>
              </Col> */}
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
                isDisabled={true}
                options={filteredStudents}
                value={form.assignedStudent}
                onChange={(selected) =>
                  setForm((prev) => ({
                    ...prev,
                    assignedStudent: selected,
                  }))
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
                    disabled={isHistoryYear}
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
                // if we're viewing history
                isHistoryYear ||
                // basic form validation
                !form.title.trim() ||
                !form.level?.value ||
                (Number(form.level?.value) >= 2 && !form.option?.value) ||
                !form.semester.trim() ||
                // make sure a teacher is picked
                !form.assignedTeacher?.value ||
                // curriculum sanity
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