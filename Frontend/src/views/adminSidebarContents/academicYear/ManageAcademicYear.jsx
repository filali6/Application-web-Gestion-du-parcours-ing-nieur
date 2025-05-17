import React, { useState } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import "./ManageAcademicYear.css";
import { createNewYear } from "services/saison";

const ManageAcademicYear = () => {
  const [newYear, setNewYear] = useState(new Date().getFullYear() + 1);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateNewYear = async () => {
    const token = localStorage.getItem("token");

    const confirmResult = await Swal.fire({
      title: "Confirm New Academic Year",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, create",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) return;

    setIsLoading(true);
    try {
      const result = await createNewYear(newYear, token);

      if (
        result.message?.toLowerCase().includes("succès") ||
        result.message?.toLowerCase().includes("success")
      ) {
        await Swal.fire({
          title: "Success",
          text: "New academic year created successfully.",
          icon: "success",
        });
        setNewYear(new Date().getFullYear() + 1);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event("newYearCreated"));
      } else if (result.studentsWithoutStatus?.length > 0) {
        const studentList = result.studentsWithoutStatus
          .map((s) => `${s.firstName} ${s.lastName} (CIN: ${s.cin})`)
          .join("<br/>");
        await Swal.fire({
          title: "Error",
          html: `The following students need a status before creating a new year:<br/>${studentList}`,
          icon: "error",
        });
      } else {
        await Swal.fire({
          title: "Error",
          text: result.message || "Failed to create new academic year.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error creating new year:", error);
      await Swal.fire({
        title: "Error",
        text:
          error.response?.data?.message ||
          "Erreur serveur lors de la création de la nouvelle année.",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="manage-academic-year-container">
      <Card className="academic-year-card">
        <Card.Body>
          <Card.Title>Create New Academic Year</Card.Title>

          <Form.Group className="mb-3">
            <Form.Control
              type="number"
              value={newYear}
              onChange={(e) => setNewYear(Number(e.target.value))}
              min={new Date().getFullYear() + 1}
              max={new Date().getFullYear() + 1}
              required
              disabled={isLoading}
            />
          </Form.Group>
          <Button
            variant="primary"
            onClick={handleCreateNewYear}
            disabled={
              !newYear || newYear !== new Date().getFullYear() + 1 || isLoading
            }
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Creating...
              </>
            ) : (
              "Create New Year"
            )}
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ManageAcademicYear;
