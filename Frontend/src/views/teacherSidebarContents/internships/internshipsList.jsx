import React, { useEffect, useState } from 'react';
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { fetchTeacherTopics } from './internshipsListservice';


const internshipsList = () => {
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
      <h2>internships List</h2>
      <div className="teacher-table-container">
        <h2 className="text-center mb-4">Sujets Affectés</h2>

        {loading ? (
          <p>Chargement des sujets...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : topics.length === 0 ? (
          <p>Aucun sujet trouvé pour cet enseignant.</p>
        ) : (
          <MDBTable align="middle" hover responsive>
            <MDBTableHead>
              <tr>
                <th>Titre du sujet</th>
                <th>Étudiant</th>
                <th>Email</th>
                <th>Documents</th>
                <th>PV</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
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
            </MDBTableBody>
          </MDBTable>
        )}
      </div>
    </div>
  );
};

export default internshipsList;
