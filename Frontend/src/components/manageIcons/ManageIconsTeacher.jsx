// src/components/ManageIcons.jsx
import React from "react";
import { MdInfo, MdEdit, MdLock, MdDelete } from "react-icons/md";
import "./ManageIcons.scss";

const ManageIconsTeacher = ({ teacher, onAction }) => {
  return (
    <div className="manage-icons">
      <MdInfo className="icon info" onClick={() => onAction("info", teacher)} />
      <MdEdit className="icon edit" onClick={() => onAction("edit", teacher)} />
      <MdLock className="icon lock" onClick={() => onAction("lock", teacher)} />
      <MdDelete
        className="icon delete"
        onClick={() => onAction("delete", teacher)}
      />
    </div>
  );
};

export default ManageIconsTeacher;
