import React from "react";
import PFAItem from "./PFAItem";
import "../../styles/pfa.css";

const PFAList = ({ pfas, setPfas }) => {
  return (
    <div className="pfa-list">
      {pfas.length === 0 ? (
        <p>Aucun PFA disponible.</p>
      ) : (
        pfas.map((pfa) => <PFAItem key={pfa._id} pfa={pfa} setPfas={setPfas} />)
      )}
    </div>
  );
};

export default PFAList;
