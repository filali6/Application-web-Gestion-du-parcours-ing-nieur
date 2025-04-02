import React, { useState, useEffect } from "react";
import { Form, Button, Card, Table } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";

const periodTypes = [
  { value: "pfa", label: "PFA for Teachers" },
  { value: "stageEte", label: "Summer Internship" },
  { value: "choicePFA", label: "PFA for Students" },
];

// Add this at the top of your component
const errorTypeMessages = {
  "already exists":
    "There's already a period of this type during the selected dates.",
  "already open": "There's an overlapping period of the same type.",
  "Network issue": "Please check your internet connection and try again.",
  "Request timeout":
    "The server is taking too long to respond. Please try again.",
  "No changes detected": "You haven't made any changes to the period.",
};

function PeriodForm({ initialData, onSubmit, onCancel }) {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    StartDate: "",
    EndDate: "",
    type: "",
  });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.type) newErrors.type = "Please select a period type";
    if (!formData.StartDate) newErrors.StartDate = "Please select a start date";
    if (!formData.EndDate) newErrors.EndDate = "Please select an end date";
    if (
      formData.StartDate &&
      formData.EndDate &&
      formData.StartDate > formData.EndDate
    ) {
      newErrors.EndDate = "End date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (date, field) => {
    setErrors((prev) => ({ ...prev, [field]: "" })); // Clear error when user selects a date
    setFormData({ ...formData, [field]: date });
  };

  const handleTypeChange = (e) => {
    setErrors((prev) => ({ ...prev, type: "" })); // Clear error when selecting a type
    setFormData({ ...formData, type: e.target.value });
  };

  const showErrorAlert = (error) => {
    // Find the most specific error message
    let message = error.message || "An unexpected error occurred.";

    // Check if error matches any known patterns
    for (const [key, value] of Object.entries(errorTypeMessages)) {
      if (message.includes(key)) {
        message = value;
        // Special case for no changes
        if (key === "No changes detected") {
          Swal.fire({
            title: "No Changes",
            text: message,
            icon: "info",
            confirmButtonText: "OK",
          });
          return;
        }
        break;
      }
    }

    Swal.fire({
      title: "Error",
      text: message,
      icon: "error",
      confirmButtonText: "OK",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);

      // Success handling
      Swal.fire({
        title: initialData ? "Updated!" : "Created!",
        text: `Period ${initialData ? "updated" : "created"} successfully.`,
        icon: "success",
        confirmButtonText: "OK",
        timer: 3000,
      });

      if (!initialData) handleCancel();
    } catch (error) {
      showErrorAlert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ StartDate: "", EndDate: "", type: "" });
    setErrors({}); // Clear all errors on cancel
    onCancel && onCancel();
  };

  // Initialize form with initialData if provided (needed for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        StartDate: initialData.StartDate
          ? new Date(initialData.StartDate)
          : null,
        EndDate: initialData.EndDate ? new Date(initialData.EndDate) : null,
      });
    }
  }, [initialData]);

  return (
    <div>
      <Card className="widget-focus-lg">
        <Card.Header>
          <h5 className="mb-3">
            {initialData ? "Edit Period" : "Create New Period"}
          </h5>
        </Card.Header>
        <Card.Body className="px-0 py-2">
          <Form onSubmit={handleSubmit}>
            <Table borderless responsive className="mb-0">
              <tbody>
                {/* Period Type Row */}
                <tr>
                  <td className="ps-4" style={{ width: "30%" }}>
                    <Form.Label className="fw-bold small">
                      Period Type
                    </Form.Label>
                  </td>
                  <td>
                    <Form.Control
                      as="select"
                      value={formData.type}
                      onChange={handleTypeChange}
                      isInvalid={!!errors.type}
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
                    {errors.type && (
                      <Form.Text className="text-danger small">
                        {errors.type}
                      </Form.Text>
                    )}
                  </td>
                </tr>

                {/* Start Date Row */}
                <tr>
                  <td className="ps-4">
                    <Form.Label className="fw-bold small">
                      Start Date
                    </Form.Label>
                  </td>
                  <td>
                    <DatePicker
                      selected={formData.StartDate}
                      onChange={(date) => handleDateChange(date, "StartDate")}
                      className={`form-control  ${errors.StartDate ? "is-invalid" : ""}`}
                      dateFormat="yyyy-MM-dd"
                      wrapperClassName="w-100"
                      placeholderText="Select start date"
                    />
                    {errors.StartDate && (
                      <div className="text-danger small mt-1">
                        {errors.StartDate}
                      </div>
                    )}
                  </td>
                </tr>

                {/* End Date Row */}
                <tr>
                  <td className="ps-4">
                    <Form.Label className="fw-bold small">End Date</Form.Label>
                  </td>
                  <td>
                    <DatePicker
                      selected={formData.EndDate}
                      onChange={(date) => handleDateChange(date, "EndDate")}
                      className={`form-control  ${errors.EndDate ? "is-invalid" : ""}`}
                      dateFormat="yyyy-MM-dd"
                      wrapperClassName="w-100"
                      minDate={formData.StartDate}
                      placeholderText="Select end date"
                    />
                    {errors.EndDate && (
                      <div className="text-danger small mt-1">
                        {errors.EndDate}
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>

            {/* Buttons */}
            <div className="d-flex justify-content-end mt-4 pe-4">
              <Button
                variant="outline-secondary"
                onClick={handleCancel}
                type="button"
                className="btn btn-outline-secondary theme-bg2 f-12 rounded-pill px-3 me-2"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="btn theme-bg text-white f-12 rounded-pill px-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Processing...
                  </>
                ) : initialData ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default PeriodForm;
