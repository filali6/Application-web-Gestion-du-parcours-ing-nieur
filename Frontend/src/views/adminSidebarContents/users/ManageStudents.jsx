import React, { useRef, useState, useCallback, useEffect } from "react";
import Button from "components/button/Button";
import { MdAddCircleOutline, MdOutlineInsertDriveFile } from "react-icons/md";
import { FiFileText } from "react-icons/fi";
import {
  importStudents,
  fetchStudents,
  getStudentById,
  deleteStudent,
} from "services/student";
import { updateStudentStatus, fetchAvailableYears } from "services/saison";
import Swal from "sweetalert2";
import GenericList from "components/Generic/GenericList";
import ManageIcons from "components/manageIcons/ManageIcons";
import StudentForm from "components/form/StudentForm";
import StudentUpdateForm from "components/form/StudentUpdateForm";
import PasswordForm from "components/form/Password";
import { Form, Row, Col } from "react-bootstrap";
import "./ManageStudents.css";

const ManageStudents = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const fileInputRef = useRef(null);
  const [reloadTrigger, setReloadTrigger] = useState(Date.now());
  const [availableYears, setAvailableYears] = useState([]);

  // Fetch available years on component mount and when reloadTrigger changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    const loadYears = async () => {
      const years = await fetchAvailableYears(token);
      setAvailableYears(years);
    };
    loadYears();
  }, [reloadTrigger]);

  // Status mapping: English (display) <-> French (backend)
  const statusMapping = {
    repeat: "redouble",
    pass: "passe",
    graduated: "diplomé",
  };

  const reverseStatusMapping = Object.fromEntries(
    Object.entries(statusMapping).map(([english, french]) => [french, english])
  );

  const getDisplayStatus = (backendStatus) =>
    reverseStatusMapping[backendStatus] || backendStatus || "Not specified";

  const getBackendStatus = (displayStatus) =>
    statusMapping[displayStatus] || displayStatus;

  const translateBackendMessage = (message) => {
    if (message?.toLowerCase().includes("statut mis à jour avec succès")) {
      return "Status updated successfully.";
    }
    if (
      message
        ?.toLowerCase()
        .includes("student must be in level 3 to be graduated")
    ) {
      return "Student is not in level 3, they can't be graduated.";
    }
    return message || "Failed to update student status.";
  };

  const stableFetchStudents = useCallback(
    async (filters, token) => {
      console.log(
        "Calling fetchStudents with filters:",
        filters,
        "token:",
        token
      );
      return await fetchStudents(filters, token);
    },
    [reloadTrigger]
  );

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const token = localStorage.getItem("token");

    if (!file) return;

    try {
      const result = await importStudents(file, token);

      if (result?.errors?.length > 0 && result?.imported > 0) {
        const errorMessages = result.errors
          .map((error) => `CIN: ${error.cin} - ${error.message}`)
          .join("\n");

        await Swal.fire({
          title: "Import Results",
          html: `
            <div style="color: red; margin-bottom: 15px;">
              <strong>Errors (${result.errors.length}):</strong><br/>
              ${errorMessages}
            </div>
            <div style="color: green;">
              <strong>Successfully imported:</strong> ${result.imported} student(s)
            </div>
          `,
          icon: "warning",
        });
        setReloadTrigger(Date.now());
      } else if (result?.errors?.length > 0) {
        const errorMessages = result.errors
          .map((error) => {
            return `CIN: ${error.cin} - ${error.message}`;
          })
          .join("\n");

        await Swal.fire({
          title: "Import Errors",
          text: errorMessages,
          icon: "error",
        });
      } else if (result?.imported > 0) {
        await Swal.fire(
          "Success",
          `Successfully imported ${result.imported} student(s).`,
          "success"
        );
        setReloadTrigger(Date.now());
      }
    } catch (error) {
      await Swal.fire(
        "Error",
        "An error occurred during the import process",
        "error"
      );
      console.error(error);
    }

    event.target.value = "";
  };

  const handleStatusChange = async (student, newDisplayStatus) => {
    const token = localStorage.getItem("token");
    const newBackendStatus = getBackendStatus(newDisplayStatus);

    if (newDisplayStatus === "graduated" && student.level !== 3) {
      await Swal.fire({
        title: "Error",
        text: "Student is not in level 3, they can't be graduated.",
        icon: "error",
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Confirm Status Change",
      text: `Are you sure you want to change ${student.firstName} ${student.lastName}'s status to "${newDisplayStatus.charAt(0).toUpperCase() + newDisplayStatus.slice(1)}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change status",
      cancelButtonText: "Cancel",
    });

    if (confirmResult.isConfirmed) {
      try {
        const result = await updateStudentStatus(
          student._id,
          newBackendStatus,
          token
        );

        const translatedMessage = translateBackendMessage(result.message);

        if (
          result.message?.toLowerCase().includes("success") ||
          result.message?.toLowerCase().includes("succès")
        ) {
          await Swal.fire({
            title: "Success",
            text: translatedMessage,
            icon: "success",
          });
          setReloadTrigger(Date.now());
        } else {
          await Swal.fire({
            title: "Error",
            text: translatedMessage,
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Error updating status:", error);
        await Swal.fire({
          title: "Error",
          text: "An unexpected error occurred while updating the status.",
          icon: "error",
        });
      }
    }
  };

  const handleActionClick = async (action, student) => {
    switch (action) {
      case "info":
        try {
          const token = localStorage.getItem("token");
          const fullStudent = await getStudentById(student._id, token);

          if (!fullStudent) {
            Swal.fire(
              "Error",
              "Unable to retrieve student information.",
              "error"
            );
            return;
          }

          const studentDetailsHtml = Object.entries(fullStudent)
            .filter(
              ([key]) =>
                !["_id", "password", "encryptedPassword", "__v"].includes(key)
            )
            .map(([key, value]) => {
              let displayValue = value ?? "Not specified";

              if (key === "history") {
                if (Array.isArray(value) && value.length > 0) {
                  displayValue = value
                    .map(
                      (item, index) =>
                        `<div><strong>History ${index + 1}:</strong> ${JSON.stringify(item)}</div>`
                    )
                    .join("<br/>");
                } else {
                  displayValue = "Not specified";
                }
              }

              return `${key}: ${displayValue}<br/>`;
            })
            .join("");

          Swal.fire({
            title: "Student Information",
            html: studentDetailsHtml,
            icon: "info",
          });
        } catch (error) {
          Swal.fire("Error", "An error occurred.", "error");
        }
        break;

      case "edit":
        setShowForm(true);
        setCurrentStudent(student);
        break;

      case "lock":
        setCurrentStudent(student);
        setShowPasswordForm(true);
        break;

      case "delete":
        try {
          const token = localStorage.getItem("token");

          const confirmResult = await Swal.fire({
            title: "Are you sure?",
            text: `Do you really want to delete ${student.firstName} ${student.lastName}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
          });

          if (confirmResult.isConfirmed) {
            const result = await deleteStudent(student._id, false, token);

            if (
              result.message?.toLowerCase().includes("succès") ||
              result.message?.toLowerCase().includes("success")
            ) {
              Swal.fire("Deleted!", "Student deleted successfully.", "success");
              setReloadTrigger(Date.now());
            } else if (
              result.message?.toLowerCase().includes("relation") ||
              result.message?.toLowerCase().includes("lié")
            ) {
              const forceResult = await Swal.fire({
                title: "Student has related data",
                text: "Student has relations with other entities. Do you want to force delete?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, force delete",
                cancelButtonText: "Cancel",
              });

              if (forceResult.isConfirmed) {
                const forcedDelete = await deleteStudent(
                  student._id,
                  true,
                  token
                );
                if (
                  forcedDelete.message?.toLowerCase().includes("succès") ||
                  forcedDelete.message?.toLowerCase().includes("success")
                ) {
                  Swal.fire(
                    "Deleted!",
                    "Student force-deleted successfully.",
                    "success"
                  );
                  setReloadTrigger(Date.now());
                } else {
                  Swal.fire(
                    "Error",
                    forcedDelete.message || "Force deletion failed.",
                    "error"
                  );
                }
              }
            } else {
              Swal.fire("Error", result.message || "Deletion failed.", "error");
            }
          }
        } catch (error) {
          console.error(error);
          Swal.fire("Error", "An unexpected error occurred.", "error");
        }
        break;
      default:
        console.warn("Unknown action:", action);
    }
  };

  const renderYearFilter = (handleFilterChange) => (
    <Form.Group as={Row} className="mb-0 me-3">
      <Col xs="auto">
        <Form.Select
          onChange={(e) => {
            const year = e.target.value;
            handleFilterChange("annee", year);
            handleFilterChange(
              "inHistory",
              year < new Date().getFullYear() + 1 ? "true" : "false"
            );
          }}
        >
          <option value="">Select Year</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Form.Select>
      </Col>
    </Form.Group>
  );

  return (
    <div className="page-container">
      <div className="buttons-container">
        <Button
          text="Add student"
          icon={<MdAddCircleOutline />}
          color="green"
          onClick={() => {
            setShowForm(true);
            setCurrentStudent(null);
          }}
        />

        <Button
          text="Import students"
          icon={<MdOutlineInsertDriveFile />}
          color="blue"
          onClick={handleImportClick}
        />

        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx, .xls"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {showForm && currentStudent && (
        <StudentUpdateForm
          student={currentStudent}
          onSuccess={() => {
            setShowForm(false);
            setReloadTrigger(Date.now());
          }}
          onCancel={() => {
            setShowForm(false);
            setCurrentStudent(null);
          }}
        />
      )}

      {showForm && !currentStudent && (
        <StudentForm
          onSuccess={() => {
            setShowForm(false);
            setReloadTrigger(Date.now());
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {showPasswordForm && currentStudent && (
        <PasswordForm
          studentId={currentStudent._id}
          onSuccess={() => {
            setShowPasswordForm(false);
            setCurrentStudent(null);
            Swal.fire({
              title: "Success",
              text: "Password updated successfully!",
              icon: "success",
            });
          }}
          onCancel={() => {
            setShowPasswordForm(false);
            setCurrentStudent(null);
          }}
        />
      )}

      <GenericList
        title="Students list"
        fetchItems={stableFetchStudents}
        reloadKey={reloadTrigger}
        columns={[
          { key: "cin", header: "CIN" },
          { key: "firstName", header: "First Name" },
          { key: "lastName", header: "Last Name" },
          { key: "email", header: "Email" },
          { key: "level", header: "Level" },
          { key: "status", header: "Status" },
          {
            key: "cv",
            header: "CV",
            style: { textAlign: "center", width: "80px" },
          },
          { key: "actions", header: "Actions" },
        ]}
        customRenderers={{
          level: (student) => (
            <td key={`level-${student._id}`}>
              {student.level !== null ? student.level : "Not specified"}
            </td>
          ),
          status: (student) => (
            <td key={`status-${student._id}`}>
              <div style={{ display: "flex", gap: "10px" }}>
                {["repeat", "pass", "graduated"].map((displayStatus) => (
                  <label key={displayStatus}>
                    <input
                      type="checkbox"
                      checked={
                        getDisplayStatus(student.status) === displayStatus
                      }
                      onChange={() =>
                        handleStatusChange(student, displayStatus)
                      }
                      disabled={
                        getDisplayStatus(student.status) === displayStatus
                      }
                      className={
                        getDisplayStatus(student.status) === displayStatus
                          ? "custom-checkbox"
                          : ""
                      }
                      style={{
                        cursor: "pointer",
                      }}
                    />
                    {displayStatus.charAt(0).toUpperCase() +
                      displayStatus.slice(1)}
                  </label>
                ))}
              </div>
            </td>
          ),
          cv: (student) => (
            <td key={`cv-${student._id}`} className="text-center">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() =>
                  window.open(`/students/${student._id}/cv`, "_blank")
                }
                title="View CV"
              >
                <FiFileText />
              </button>
            </td>
          ),
          actions: (student) => (
            <td key={`actions-${student._id}`}>
              <ManageIcons student={student} onAction={handleActionClick} />
            </td>
          ),
        }}
        searchFields={["cin", "firstName", "lastName", "email"]}
        additionalFilters={renderYearFilter}
      />
    </div>
  );
};

export default ManageStudents;
