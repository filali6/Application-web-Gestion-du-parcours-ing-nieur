// src/components/ManageIcons.jsx
import React from "react";
import { MdInfo, MdEdit, MdLock, MdDelete } from "react-icons/md";
import "./ManageIcons.scss"; // tu peux styliser les icônes ici si besoin

const ManageIcons = ({ student, onAction }) => {
  return (
    <div className="manage-icons">
      <MdInfo className="icon info" onClick={() => onAction("info", student)} />
      <MdEdit className="icon edit" onClick={() => onAction("edit", student)} />
      <MdLock className="icon lock" onClick={() => onAction("lock", student)} />
      <MdDelete
        className="icon delete"
        onClick={() => onAction("delete", student)}
      />
    </div>
  );
};

export default ManageIcons;
