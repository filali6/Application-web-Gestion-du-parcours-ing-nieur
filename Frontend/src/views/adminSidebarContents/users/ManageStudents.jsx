import React, { useRef, useState, useCallback } from "react";
import Button from "components/button/Button";
import { MdAddCircleOutline, MdOutlineInsertDriveFile } from "react-icons/md";
import {
  importStudents,
  fetchStudents,
  getStudentById,
  deleteStudent,
} from "services/student";
import Swal from "sweetalert2";
import GenericList from "components/Generic/GenericList";
import ManageIcons from "components/manageIcons/ManageIcons";

const ManageStudents = () => {
  const fileInputRef = useRef(null);
  const [reloadTrigger, setReloadTrigger] = useState(Date.now());

  const stableFetchStudents = useCallback(async (filters, token) => {
    console.log("Calling fetchStudents with token:", token);
    return await fetchStudents(filters, token);
  }, []);

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const token = localStorage.getItem("token");

    if (!file) return;

    try {
      const result = await importStudents(file, token);

      // If there are import errors
      if (result?.errors && result.errors.length > 0) {
        const errorMessages = result.errors
          .map((error) => `CIN: ${error.cin} - ${error.message}`)
          .join("\n");

        Swal.fire({
          title: "Import Errors",
          text: errorMessages,
          icon: "error",
        });
      }

      // If students were successfully imported
      if (result?.imported > 0) {
        const count = result.imported || 0;
        Swal.fire(
          "Success",
          `Successfully imported ${count} student(s).`,
          "success"
        );

        // Reload the student list without refreshing the page
        setReloadTrigger(Date.now());
        console.log("Reload triggered", Date.now());
      }

      // If there are errors and students were also imported
      if (result?.errors && result.errors.length > 0 && result.imported > 0) {
        const errorMessages = result.errors
          .map((error) => `CIN: ${error.cin} - ${error.message}`)
          .join("\n");

        Swal.fire({
          title: "Import Errors",
          text: `${errorMessages}\nBut some students were successfully imported.`,
          icon: "warning",
        });

        // Reload the student list without refreshing the page
        setReloadTrigger(Date.now());
        console.log("Reload triggered", Date.now());
      }
    } catch (error) {
      Swal.fire(
        "Error",
        "An error occurred during the import process",
        "error"
      );
      console.error(error);
    }

    event.target.value = "";
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
              if (
                key === "history" &&
                Array.isArray(value) &&
                value.length > 0
              ) {
                displayValue = value
                  .map(
                    (item, index) =>
                      `<div><strong>History ${index + 1}:</strong> ${JSON.stringify(item)}</div>`
                  )
                  .join("<br/>");
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
        Swal.fire("Edit", `Edit student ${student.firstName}`, "question");
        break;

      case "lock":
        Swal.fire(
          "Locked",
          `Account of ${student.firstName} is locked.`,
          "warning"
        );
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
              // Deuxième alerte pour la suppression forcée
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

  return (
    <div className="page-container">
      <div className="buttons-container">
        <Button
          text="Add student"
          icon={<MdAddCircleOutline />}
          color="green"
          onClick={() => console.log("Add a student")}
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
          {
            key: "actions",
            header: "Actions",
            render: (student) => (
              <ManageIcons student={student} onAction={handleActionClick} />
            ),
          },
        ]}
        searchFields={["cin", "firstName", "lastName", "email"]}
      />
    </div>
  );
};

export default ManageStudents;
