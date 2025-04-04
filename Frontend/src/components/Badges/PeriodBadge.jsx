import React from "react";
import { Badge } from "react-bootstrap";
import PropTypes from "prop-types";

const PeriodBadge = ({ type, periodTypes }) => {
  const typeData = periodTypes[type] || {
    label: type,
    color: "secondary",
  };

  return (
    <Badge
      pill
      className={`text-capitalize text-white ${typeData.color}`}
      style={{
        padding: "0.35rem 0.75rem",
        fontSize: "0.75rem",
        fontWeight: 500,
      }}
    >
      {typeData.label}
    </Badge>
  );
};

PeriodBadge.propTypes = {
  type: PropTypes.string.isRequired,
  periodTypes: PropTypes.object.isRequired,
};

export default PeriodBadge;