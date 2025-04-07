import React, { useEffect, useState } from "react";
import { Table, Spinner, Alert } from "react-bootstrap"; // Import des composants react-bootstrap
import { fetchTeacherTopics } from "./internshipsListservice";

const InternshipsList = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const data = await fetchTeacherTopics();
        setTopics(data);
      } catch (err) {
        setError("Erreur lors du chargement des sujets.");
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  return (
    <div>
      <h2>Internships List</h2>
      <div className="teacher-table-container">
        <h2 className="text-center mb-4">Assigned Subjects</h2>

        {loading ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : topics.length === 0 ? (
          <Alert variant="info">No subject found for this teacher.</Alert>
        ) : (
          <Table
            striped
            bordered
            hover
            responsive
            style={{
              borderCollapse: "collapse",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <thead>
              <tr>
                <th>Title Subject</th>
                <th>Student</th>
                <th>Email</th>
                <th>Documents</th>
                <th>PV</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic, index) => (
                <tr key={index}>
                  <td>{topic.sujetTitre}</td>
                  <td>{topic.studentName || "Non précisé"}</td>
                  <td>{topic.studentEmail}</td>
                  <td>
                    {topic.documents.length > 0
                      ? topic.documents.map((doc, i) => (
                          <div key={i}>
                            <a
                              href={`http://localhost:5000/uploads/${doc.filename}`} // Lien vers le fichier
                              target="_blank"
                              rel="noopener noreferrer"
                              download={doc.title} // Téléchargement avec le nom du fichier
                            >
                              📄{doc.title}
                            </a>
                          </div>
                        ))
                      : "Aucun document"}
                  </td>

                  <td>{topic.pv ? topic.pv : "Non disponible"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default InternshipsList;
