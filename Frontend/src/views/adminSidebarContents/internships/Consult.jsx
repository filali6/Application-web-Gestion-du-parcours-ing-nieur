import React, { useEffect, useState } from "react";
import { getPlanningsDetails } from "services/internshipmanage";
import { Container, Table, Spinner } from "react-bootstrap";

const Consult = () => {
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noSubjectsMessage, setNoSubjectsMessage] = useState(""); // Ajout d'un état pour le message

  useEffect(() => {
    const fetchPlannings = async () => {
      try {
        const data = await getPlanningsDetails();
        if (data.length === 0) {
          setNoSubjectsMessage("Aucun sujet pour le moment.");
        } else {
          setPlannings(data);
        }
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

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <p>{error}</p>;

  // Si il n'y a pas de sujet, afficher le message
  if (noSubjectsMessage) return <p>{noSubjectsMessage}</p>;

  return (
    <div className="teacher-table-container">
      <h2 className="text-center mb-4">Subject List</h2>

      <Container className="my-4">
        <Table
          striped
          hover
          responsive
          style={{
            borderCollapse: "collapse",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Ombre légère
          }}
        >
          <thead>
            <tr>
              <th>Student</th>
              <th>Student Email</th>
              <th>Teacher</th>
              <th>Teacher Email</th>
              <th>Documents soumis</th>
              <th>Statut</th>
              <th>Publish</th>
            </tr>
          </thead>
          <tbody>
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
          </tbody>
        </Table>
      </Container>
    </div>
  );
};

export default Consult;
