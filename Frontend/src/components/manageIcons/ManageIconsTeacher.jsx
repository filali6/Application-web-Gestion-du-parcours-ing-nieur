import React from "react";
import { MdInfo, MdEdit, MdLock, MdDelete } from "react-icons/md";
import "./ManageIcons.scss";

const ManageIconsTeacher = ({ teacher, onAction }) => {
  return (
    <div className="manage-icons">
      <MdInfo
        key="info-icon"
        className="icon info"
        onClick={() => onAction("info", teacher)}
      />
      <MdEdit
        key="edit-icon"
        className="icon edit"
        onClick={() => onAction("edit", teacher)}
      />
      <MdLock
        key="lock-icon"
        className="icon lock"
        onClick={() => onAction("lock", teacher)}
      />
      <MdDelete
        key="delete-icon"
        className="icon delete"
        onClick={() => onAction("delete", teacher)}
      />
    </div>
  );
};

export default ManageIconsTeacher;
