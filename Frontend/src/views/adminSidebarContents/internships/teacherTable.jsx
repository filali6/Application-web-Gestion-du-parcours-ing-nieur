import React, { useState, useEffect } from "react";
import {
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBCheckbox,
} from "mdb-react-ui-kit";
import {
  assignTeachersToTopics,
  fetchTeachers,
  getPlans,
  togglePlanVisibility,
  updateTeacherForPlan,
} from "./serviceInternshipAdmin";
import UpdatePlanModal from "./updatePlan";

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
        prevPlans.map((plan) => ({ ...plan, isPublished: shouldPublish })))
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

  // Nouvelle fonction pour récupérer les plans et mettre à jour l'état
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
      <h2 className="text-center mb-4">Liste des Enseignants</h2>

      {loading ? (
        <p>Chargement des enseignants...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : teachers.length === 0 ? (
        <p>Aucun enseignant trouvé.</p>
      ) : !showPlans ? (
        <>
          <MDBTable align="middle" hover responsive>
            <MDBTableHead>
              <tr>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Grade</th>
                <th>CIN</th>
                <th>Actions</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td>{teacher.firstName}</td>
                  <td>{teacher.lastName}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.grade}</td>
                  <td>{teacher.cin || "N/A"}</td>
                  <td>
                    <MDBCheckbox
                      name="teacherCheckbox"
                      id={`teacher-${teacher._id}`}
                      value={teacher.cin}
                      label="Affecter"
                      checked={selectedTeachers.includes(teacher._id)}
                      onChange={() => handleCheckboxChange(teacher._id)}
                    />
                  </td>
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable>

          <div className="text-center mt-4">
            <MDBBtn
              color="primary"
              rounded
              size="sm"
              onClick={handleShowPlanning}
            >
              Show Planning
            </MDBBtn>
          </div>

          <div className="text-center mt-4">
            <MDBBtn
              color="success"
              rounded
              size="sm"
              onClick={handleAssignTeachers}
            >
              Affecter les Enseignants
            </MDBBtn>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-center mb-4">Liste des Plannings</h3>
          {loadingPlans ? (
            <p>Chargement des plannings...</p>
          ) : (
            <div className="d-flex flex-wrap justify-content-center">
              {plans.length === 0 ? (
                <p>Aucun planning trouvé.</p>
              ) : (
                plans.map((plan) => (
                  <MDBCard
                    className="m-3"
                    style={{ width: "18rem" }}
                    key={plan._id}
                  >
                    <MDBCardBody>
                      <MDBCardTitle>
                        {plan.sujet.titre || "Sujet Inconnu"}
                      </MDBCardTitle>
                      <MDBCardText>
                        Enseignant : {plan.teachers?.firstName}{" "}
                        {plan.teachers?.lastName}
                      </MDBCardText>
                      <MDBCardText>
                        Étudiant : {plan.sujet?.student?.firstName}{" "}
                        {plan.sujet?.student?.lastName}
                      </MDBCardText>
                      <MDBBtn
                        color="warning"
                        rounded
                        size="sm"
                        className="ms-2"
                        onClick={() => handleOpenUpdateModal(plan)}
                      >
                        Modifier
                      </MDBBtn>
                    </MDBCardBody>
                  </MDBCard>
                ))
              )}
            </div>
          )}

          {plans.length > 0 && (
            <div className="text-center mt-4">
              <MDBBtn
                color={plans.every((p) => p.isPublished) ? "danger" : "success"}
                rounded
                size="sm"
                onClick={handleToggleAllVisibility}
              >
                {plans.every((p) => p.isPublished) ? "Masquer" : "Publier"}
              </MDBBtn>
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
    </div>
  );
};

export default TeacherTable;
