import React, { useState, useEffect } from "react";
import { Form, Card, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import DatePickerField from "../../../components/Fields/DatePickerField";
import PeriodTypeSelect from "../../../components/Fields/PeriodTypeSelect";
import FormButtons from "../../../components/Buttons/FormButtons";
import { periodTypes, errorTypeMessages } from "./constants";

const PeriodForm = ({ initialData, onSubmit, onCancel }) => {
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
      newErrors.StartDate = "Start date must be before end date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (date, field) => {
    setErrors((prev) => ({
      ...prev,
      StartDate: "", // Clear StartDate error on any date change
      EndDate: "", // Clear EndDate error on any date change
    }));
    setFormData({ ...formData, [field]: date });
  };

  const handleTypeChange = (e) => {
    setErrors((prev) => ({ ...prev, type: "" }));
    setFormData({ ...formData, type: e.target.value });
  };

  const showErrorAlert = (error) => {
    let message = error.message || "An unexpected error occurred.";

    for (const [key, value] of Object.entries(errorTypeMessages)) {
      if (message.includes(key)) {
        message = value;
        // for the update alert
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
    setErrors({});
    onCancel && onCancel();
  };

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

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        StartDate: initialData.StartDate
          ? new Date(initialData.StartDate)
          : null,
        EndDate: initialData.EndDate ? new Date(initialData.EndDate) : null,
      });
      setErrors({}); // Clear existing errors when initial data changes
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
                <tr>
                  <td className="ps-4" style={{ width: "30%" }}>
                    <Form.Label className="fw-bold small">
                      Period Type
                    </Form.Label>
                  </td>
                  <td>
                    <PeriodTypeSelect
                      value={formData.type}
                      onChange={handleTypeChange}
                      error={errors.type}
                      periodTypes={periodTypes}
                    />
                  </td>
                </tr>

                <tr>
                  <td className="ps-4">
                    <Form.Label className="fw-bold small">
                      Start Date
                    </Form.Label>
                  </td>
                  <td>
                    <DatePickerField
                      selected={formData.StartDate}
                      onChange={handleDateChange}
                      error={errors.StartDate}
                      placeholderText="Select start date"
                      fieldName="StartDate"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="ps-4">
                    <Form.Label className="fw-bold small">End Date</Form.Label>
                  </td>
                  <td>
                    <DatePickerField
                      selected={formData.EndDate}
                      onChange={handleDateChange}
                      error={errors.EndDate}
                      minDate={formData.StartDate}
                      placeholderText="Select end date"
                      fieldName="EndDate"
                    />
                  </td>
                </tr>
              </tbody>
            </Table>

            <FormButtons
              isSubmitting={isSubmitting}
              onCancel={handleCancel}
              isEditMode={!!initialData}
            />
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

PeriodForm.propTypes = {
  initialData: PropTypes.shape({
    type: PropTypes.string,
    StartDate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    EndDate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default PeriodForm;
