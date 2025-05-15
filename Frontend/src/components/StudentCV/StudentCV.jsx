import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getStudentCV } from "../../services/student";
import Loader from "../Loader/Loader";
import "./StudentCV.scss";

const StudentCV = () => {
  const { studentId } = useParams();
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getStudentCV(studentId, token);
        setCvData(data);
      } catch (err) {
        setError("Failed to load CV");
        console.error("Error fetching CV:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, [studentId]);

  const renderSection = (title, items, itemRenderer) => (
    <section className="cv-section">
      <h3>{title}</h3>
      {items?.length > 0 ? (
        <ul className="items-list">
          {items.map((item, index) => (
            <li key={index} className="item">
              {itemRenderer(item)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-items">No {title.toLowerCase()} listed</p>
      )}
    </section>
  );

  if (loading) return <Loader />;
  if (error) return <div className="error">{error}</div>;
  if (!cvData) return <div className="not-found">CV not found</div>;

  return (
    <div className="cv-container">
      <header className="cv-header">
        <h1>
          {cvData.student.firstName} {cvData.student.lastName}
        </h1>
      </header>

      {renderSection("Skills", cvData.cv.skills, (skill) => skill.name)}

      {renderSection(
        "Internships",
        cvData.cv.topics,
        (topic) =>
          `${topic.titre} - ${topic.company || ""} - ${topic.description || ""}`
      )}

      {cvData.cv.pfa && (
        <section className="cv-section">
          <h3>PFA</h3>
          <div className="project-details">
            <p>
              <strong>Title:</strong> {cvData.cv.pfa.title}
            </p>
            <p>
              <strong>Technologies:</strong>{" "}
              {cvData.cv.pfa.technologies?.join(", ")}
            </p>
            <p>
              <strong>Year:</strong> {cvData.cv.pfa.year}
            </p>
          </div>
        </section>
      )}

      {cvData.cv.pfe && (
        <section className="cv-section">
          <h3>PFE</h3>
          <div className="project-details">
            <p>
              <strong>Title:</strong> {cvData.cv.pfe.title}
            </p>
            <p>
              <strong>Company:</strong> {cvData.cv.pfe.nameCompany}
            </p>
            <p>
              <strong>Technologies:</strong>{" "}
              {cvData.cv.pfe.technologies?.join(", ")}
            </p>
            <p>
              <strong>Year:</strong> {cvData.cv.pfe.year}
            </p>
          </div>
        </section>
      )}

      {renderSection(
        "Diplomas",
        cvData.cv.diplomas,
        (diploma) => `${diploma.title} (${diploma.year})`
      )}

      {renderSection(
        "Languages",
        cvData.cv.languages,
        (language) => language.name
      )}

      {renderSection(
        "Experiences",
        cvData.cv.experiences,
        (experience) => `${experience.title} - ${experience.periode}`
      )}

      {renderSection(
        "Certifications",
        cvData.cv.certifications,
        (certification) => `${certification.name} (${certification.year})`
      )}
    </div>
  );
};
export default StudentCV;
