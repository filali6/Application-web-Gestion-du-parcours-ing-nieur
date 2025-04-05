import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PropTypes from "prop-types";

const DatePickerField = ({
  label,
  selected,
  onChange,
  error,
  minDate,
  placeholderText,
  fieldName,
}) => (
  <>
    <DatePicker
      selected={selected}
      onChange={(date) => onChange(date, fieldName)}
      className={`form-control ${error ? "is-invalid" : ""}`}
      dateFormat="yyyy-MM-dd"
      wrapperClassName="w-100"
      minDate={minDate}
      placeholderText={placeholderText}
    />
    {error && <div className="text-danger small mt-1">{error}</div>}
  </>
);

DatePickerField.propTypes = {
  selected: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  minDate: PropTypes.instanceOf(Date),
  placeholderText: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
};

export default DatePickerField;