import React, { useEffect, useState } from "react";
import "./Internships.css";
import ProjectForm from "./ProjectForm"; 
import { getTopics } from "services/internshipservicesstudent";
import { useNavigate } from "react-router-dom";
 

const MyInternships = () => {
  const [showForm, setShowForm] = useState(false);
   const [topics, setTopics] = useState([]);
   const navigate = useNavigate();
     useEffect(() => {
       loadTopics();
     }, []);

  const loadTopics = async () => {
    try {
      const data = await getTopics();
      setTopics(data.topics);
    } catch (error) {
      console.error("Erreur lors du chargement des sujets :", error);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };
  return (
    <div>
      <h2>My Internships</h2>
      
      <button className="floating-btn" onClick={toggleForm}>
        +
      </button>
      {showForm && (
        <ProjectForm onTopicAdded={loadTopics} onClose={toggleForm} />
      )}
      <div className="topics-list">
        {topics.map((topic) => (
          <div className="topic-card" key={topic.id}>
            <div className="topic-content">
              <p className="topic-title">{topic.titre}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyInternships;
