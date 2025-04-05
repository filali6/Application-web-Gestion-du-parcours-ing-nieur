import React from "react";
import { Badge } from "react-bootstrap";
import PropTypes from "prop-types";

const StatusBadge = ({ status }) => (
  <Badge pill bg={status.variant} className="text-capitalize">
    {status.label}
  </Badge>
);

StatusBadge.propTypes = {
  status: PropTypes.shape({
    label: PropTypes.string.isRequired,
    variant: PropTypes.string.isRequired,
  }).isRequired,
};

export default StatusBadge;