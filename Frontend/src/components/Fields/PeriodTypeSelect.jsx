import React from "react";
import { Form } from "react-bootstrap";
import PropTypes from "prop-types";

const PeriodTypeSelect = ({ value, onChange, error, periodTypes }) => (
  <>
    <Form.Control
      as="select"
      value={value}
      onChange={onChange}
      isInvalid={!!error}
      className="form-control-sm"
      style={{ fontSize: "0.84rem" }}
    >
      <option value="" disabled>
        Select period type
      </option>
      {periodTypes.map((type) => (
        <option key={type.value} value={type.value}>
          {type.label}
        </option>
      ))}
    </Form.Control>
    {error && <Form.Text className="text-danger small">{error}</Form.Text>}
  </>
);

PeriodTypeSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  periodTypes: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default PeriodTypeSelect;
