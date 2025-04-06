import React from "react";
import { Form } from "react-bootstrap";
import PropTypes from "prop-types";

<<<<<<< HEAD
const PeriodTypeSelect = ({ value, onChange, error, periodTypes }) => (
=======
const PeriodTypeSelect = ({
  value,
  onChange,
  error,
  periodTypes,
  restrictToChoiceForStudents,
}) => (
>>>>>>> fc4f74dbfd5ae703c3b584233336af9b5f802564
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
<<<<<<< HEAD
        <option key={type.value} value={type.value}>
=======
        <option
          key={type.value}
          value={type.value}
          disabled={restrictToChoiceForStudents && type.value !== "choicePFA"}
        >
>>>>>>> fc4f74dbfd5ae703c3b584233336af9b5f802564
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
<<<<<<< HEAD
};

export default PeriodTypeSelect;
=======
  restrictToChoiceForStudents: PropTypes.bool, // Ajouté ici
};

export default PeriodTypeSelect;
>>>>>>> fc4f74dbfd5ae703c3b584233336af9b5f802564
