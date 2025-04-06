import React, { useEffect, useState } from "react";
import { getPlanningsDetails } from "services/internshipmanage";
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
  MDBContainer,
} from "mdb-react-ui-kit";
import "./Consult.css";

const Consult = () => {
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchPlannings = async () => {
      try {
        const data = await getPlanningsDetails();
        setPlannings(data);
      } catch (error) {
        setError(
          "Une erreur est survenue lors de la récupération des plannings"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPlannings();
  }, []);

  if (loading) return <p>Chargement des données...</p>;
  if (error) return <p>{error}</p>;

  

  return (
    <div className="teacher-table-container">
      <h2 className="text-center mb-4">Liste des Sujets</h2>

      <MDBContainer className="my-4">
        <MDBTable align="middle" hover responsive>
          <MDBTableHead>
            <tr>
              <th>Étudiant</th>
              <th>Email Étudiant</th>
              <th>Enseignant</th>
              <th>Email Enseignant</th>
              <th>Documents soumis</th>
              <th>Statut</th>
              <th>Publication</th>
              
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {plannings.map((planning) => (
              <tr key={planning.id}>
                <td>{planning.studentName}</td>
                <td>{planning.studentEmail}</td>
                <td>{planning.teacherName}</td>
                <td>{planning.teacherEmail}</td>
                <td>{planning.documents.length > 0 ? "Oui" : "Non"}</td>
                <td>{planning.submissionStatus}</td>
                <td>{planning.isPublished ? "Publié" : "Non publié"}</td>
                 
              </tr>
            ))}
          </MDBTableBody>
        </MDBTable>
      </MDBContainer>
    </div>
  );
};

export default Consult;
