import React from "react";
import { MdInfo, MdEdit, MdLock, MdDelete } from "react-icons/md";
import "./ManageIcons.scss";

const ManageIcons = ({ student, onAction }) => {
  return (
    <div className="manage-icons">
      <MdInfo
        key="info-icon"
        className="icon info"
        onClick={() => onAction("info", student)}
      />
      <MdEdit
        key="edit-icon"
        className="icon edit"
        onClick={() => onAction("edit", student)}
      />
      <MdLock
        key="lock-icon"
        className="icon lock"
        onClick={() => onAction("lock", student)}
      />
      <MdDelete
        key="delete-icon"
        className="icon delete"
        onClick={() => onAction("delete", student)}
      />
    </div>
  );
};

export default ManageIcons;
