import React, { useState, useEffect } from "react";
import { Table, Button, Card, Form } from "react-bootstrap";
import {
  assignTeachersToTopics,
  fetchTeachers,
  getPlans,
  togglePlanVisibility,
  updateTeacherForPlan,
} from "./serviceInternshipsAdmin";
import UpdatePlanModal from "./updatePlan";
import SendMailModal from "./sendMail";

const TeacherTable = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [showPlans, setShowPlans] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEmailPlan, setSelectedEmailPlan] = useState(null);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const data = await fetchTeachers();
        setTeachers(data);
      } catch (err) {
        setError("Erreur lors du chargement des enseignants.");
      } finally {
        setLoading(false);
      }
    };

    loadTeachers();
  }, []);

  const handleShowPlanning = async () => {
    setLoadingPlans(true);
    try {
      const result = await getPlans();
      setPlans(result.plans);
      setShowPlans(true);
    } catch (err) {
      setError("Erreur lors de la récupération des plannings.");
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleToggleAllVisibility = async () => {
    try {
      const shouldPublish = !plans.every((plan) => plan.isPublished);
      await togglePlanVisibility(shouldPublish);

      setPlans((prevPlans) =>
        prevPlans.map((plan) => ({ ...plan, isPublished: shouldPublish }))
      );
    } catch (err) {
      setError("Erreur lors de la modification globale des visibilités.");
    }
  };

  const handleCheckboxChange = (teacherId) => {
    setSelectedTeachers((prevSelected) =>
      prevSelected.includes(teacherId)
        ? prevSelected.filter((id) => id !== teacherId)
        : [...prevSelected, teacherId]
    );
  };

  const handleAssignTeachers = async () => {
    try {
      await assignTeachersToTopics(selectedTeachers);
      setSelectedTeachers([]);
      alert("Enseignants affectés avec succès !");
    } catch (err) {
      setError("Erreur lors de l'affectation des enseignants.");
    }
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleOpenUpdateModal = (plan) => {
    setSelectedPlan(plan);
    setShowPopup(true); // Ouvre le modal
  };

  const handleOpenEmailModal = (plan) => {
    setSelectedEmailPlan(plan);
    setShowEmailModal(true);
  };

  const toggleEmailPopup = () => {
    setShowEmailModal(!showEmailModal);
  };

  const fetchAndUpdatePlans = async () => {
    try {
      const data = await getPlans();
      setPlans(data.plans); // Mise à jour de l'état avec les nouveaux plans
    } catch (error) {
      console.error("Erreur lors de la récupération des plannings:", error);
    }
  };

  const handleUpdateTeacher = async (planId, newTeacherId, internshipId) => {
    try {
      await updateTeacherForPlan(planId, newTeacherId, internshipId);
      await fetchAndUpdatePlans(); // 🔄 Met à jour la liste après modif
      setShowPopup(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'enseignant.", err);
      setError("Erreur lors de la mise à jour de l'enseignant.");
    }
  };

  return (
    <div className="teacher-table-container">
      <h2 className="text-center mb-4">Teachers List</h2>

      {loading ? (
        <p>Loading Teachers...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : teachers.length === 0 ? (
        <p>Aucun enseignant trouvé.</p>
      ) : !showPlans ? (
        <>
          <Table
            striped
            hover
            responsive
            style={{
              borderCollapse: "collapse",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Grade</th>
                <th>CIN</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td>{teacher.firstName}</td>
                  <td>{teacher.lastName}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.grade}</td>
                  <td>{teacher.cin || "N/A"}</td>
                  <td>
                    <Form.Check
                      type="checkbox"
                      id={`teacher-${teacher._id}`}
                      label="Assign"
                      checked={selectedTeachers.includes(teacher._id)}
                      onChange={() => handleCheckboxChange(teacher._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button variant="primary" size="sm" onClick={handleShowPlanning}>
              Show Planning
            </Button>
            <Button variant="success" size="sm" onClick={handleAssignTeachers}>
              Assign Teacher
            </Button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-center mb-4">Liste des Plannings</h3>
          {loadingPlans ? (
            <p>Loading plannings...</p>
          ) : (
            <div className="d-flex flex-wrap justify-content-center">
              {plans.length === 0 ? (
                <p>No planning found.</p>
              ) : (
                plans.map((plan) => (
                  <Card
                    style={{ width: "18rem" }}
                    key={plan._id}
                    className="m-3 shadow-sm"
                  >
                    <Card.Body>
                      <Card.Title>
                        {plan.sujet.titre || "Sujet Inconnu"}
                      </Card.Title>
                      <Card.Text>
                        Teacher : {plan.teachers?.firstName}{" "}
                        {plan.teachers?.lastName}
                      </Card.Text>
                      <Card.Text>
                        Student : {plan.sujet?.student?.firstName}{" "}
                        {plan.sujet?.student?.lastName}
                      </Card.Text>
                      <Button
                        variant="warning"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleOpenUpdateModal(plan)}
                      >
                        Update
                      </Button>
                    </Card.Body>
                  </Card>
                ))
              )}
            </div>
          )}

          {plans.length > 0 && (
            <div className="text-center mt-4">
              <Button
                variant={
                  plans.every((p) => p.isPublished) ? "danger" : "success"
                }
                size="sm"
                onClick={handleToggleAllVisibility}
              >
                {plans.every((p) => p.isPublished) ? "Hide" : "Publish"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="ms-2"
                onClick={toggleEmailPopup}
              >
                Send Planning
              </Button>
            </div>
          )}
        </>
      )}

      {/* ✅ Le popup s'affiche ici */}
      {showPopup && selectedPlan && (
        <UpdatePlanModal
          show={showPopup}
          toggleShow={togglePopup}
          onSubmit={handleUpdateTeacher}
          plan={selectedPlan}
        />
      )}
      {showEmailModal && (
        <SendMailModal show={showEmailModal} toggleShow={toggleEmailPopup} />
      )}
    </div>
  );
};

export default TeacherTable;
