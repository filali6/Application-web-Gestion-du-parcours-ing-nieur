import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const EditButton = ({ onClick, title }) => (
  <Link
    to="#"
    className="btn btn-icon btn-sm rounded-pill"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    style={{
      color: "#1cdcc8",
      borderColor: "#1cdcc8",
      backgroundColor: "transparent",
      transition: "all 0.3s ease",
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.color = "#fff";
      e.currentTarget.style.backgroundColor = "#1cdcc8";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.color = "#1cdcc8";
      e.currentTarget.style.backgroundColor = "transparent";
    }}
    title={title}
  >
    <i className="feather icon-edit"></i>
  </Link>
);

EditButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export default EditButton;