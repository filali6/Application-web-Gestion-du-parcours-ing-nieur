import React from "react";
import {
  InfoOutlined,
  EditOutlined,
  DeleteOutline,
  LockOutlined,
} from "@mui/icons-material";
import "./Row.scss";

const Row = ({ student }) => {
  return (
    <div className="row-container">
      <span>{student.cin}</span>
      <span>
        {student.firstName} {student.lastName}
      </span>
      <span>{student.email}</span>
      <span>{student.level}</span>
      <div className="actions">
        <button className="view">
          <InfoOutlined />
        </button>
        <button className="edit">
          <EditOutlined />
        </button>
        <button className="lock">
          <LockOutlined />
        </button>
        <button className="delete">
          <DeleteOutline />
        </button>
      </div>
    </div>
  );
};

export default Row;
