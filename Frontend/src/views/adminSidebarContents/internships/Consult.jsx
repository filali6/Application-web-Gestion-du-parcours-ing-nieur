import React, { useEffect, useState } from "react";
import { getPlanningsDetails } from "services/internshipmanage";
import "./Consult.css"
const Consult = () => {
  const [plannings,setPlannings]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  useEffect(()=>{
    const fetchPlannings=async()=>{
      try {
        const data =await getPlanningsDetails();
        setPlannings(data);
      }
      catch(error){
        setError("une erreur est survenue lors de la recuperation des plannings");

      }finally{
      setLoading(false);}
    };
    fetchPlannings();
  },[]);
  if (loading){
    return <p>Chargement des donnée ...</p>
  }
  if (error){
    return <p>{error}</p>
  }
    return (
    <div className="page-container">
      <h4>Liste des Sujets et Étudiants</h4>
      <div className="plannings-list">
        {plannings.map((planning, index) => (
          <div key={index} className="planning-card">
            <h5>{planning.studentName}</h5>
            <p>Email: {planning.studentEmail}</p>
            <p>Enseignant: {planning.teacherName}</p>
            <p>Email Enseignant: {planning.teacherEmail}</p>
            <p>Documents soumis: {planning.documents.length > 0 ? "Oui" : "Non"}</p>
            <p>Status: {planning.submissionStatus}</p>
            <p>{planning.isPublished ? "Publié" : "Non publié"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Consult;