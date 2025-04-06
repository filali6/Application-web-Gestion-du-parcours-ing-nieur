import React, { useRef, useState, useCallback } from "react";
import Button from "components/button/Button";
import { MdAddCircleOutline, MdOutlineInsertDriveFile } from "react-icons/md";
import {
  importTeachers,
  fetchTeachers,
  getTeacherById,
  deleteTeacher,
} from "services/teacher";
import Swal from "sweetalert2";
import GenericList from "components/Generic/GenericList";
import ManageIconsTeacher from "components/manageIcons/ManageIconsTeacher";
import TeacherForm from "components/form/TeacherForm";
import TeacherUpdateForm from "components/form/TeacherUpdateForm";
import PasswordTeacher from "components/form/PasswordTeacher";

const ManageTeachers = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const fileInputRef = useRef(null);
  const [reloadTrigger, setReloadTrigger] = useState(Date.now());

  const stableFetchTeachers = useCallback(
    async (filters, token) => {
      console.log("Calling Teachers with token:", token);
      return await fetchTeachers(filters, token);
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
      const result = await importTeachers(file, token);

      // Cas mixte (erreurs + succès)
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
              <strong>Successfully imported:</strong> ${result.imported} teacher(s)
            </div>
          `,
          icon: "warning",
        });
        setReloadTrigger(Date.now());
      }
      // Erreurs seulement
      else if (result?.errors?.length > 0) {
        const errorMessages = result.errors
          .map((error) => `CIN: ${error.cin} - ${error.message}`)
          .join("\n");

        await Swal.fire({
          title: "Import Errors",
          text: errorMessages,
          icon: "error",
        });
      }
      // Succès seulement
      else if (result?.imported > 0) {
        await Swal.fire(
          "Success",
          `Successfully imported ${result.imported} teacher(s).`,
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

  const handleActionClick = async (action, teacher) => {
    switch (action) {
      case "info":
        try {
          const token = localStorage.getItem("token");
          const fullTeacher = await getTeacherById(teacher._id, token);

          if (!fullTeacher) {
            Swal.fire(
              "Error",
              "Unable to retrieve teacher information.",
              "error"
            );
            return;
          }

          const teacherDetailsHtml = Object.entries(fullTeacher)
            .filter(
              ([key]) =>
                !["_id", "password", "encryptedPassword", "__v"].includes(key)
            )
            .map(([key, value]) => {
              let displayValue = value ?? "Not specified";

              // Handle 'history' field, display 'Not specified' if it's an empty array
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
            title: "Teacher Information",
            html: teacherDetailsHtml,
            icon: "info",
          });
        } catch (error) {
          Swal.fire("Error", "An error occurred.", "error");
        }
        break;

      case "edit":
        setShowForm(true);
        setCurrentTeacher(teacher);
        break;

      case "lock":
        setCurrentTeacher(teacher);
        setShowPasswordForm(true);
        break;

      case "delete":
        try {
          const token = localStorage.getItem("token");

          const confirmResult = await Swal.fire({
            title: "Are you sure?",
            text: `Do you really want to delete ${teacher.firstName} ${teacher.lastName}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
          });

          if (confirmResult.isConfirmed) {
            const result = await deleteTeacher(teacher._id, false, token);

            if (
              result.message?.toLowerCase().includes("succès") ||
              result.message?.toLowerCase().includes("success")
            ) {
              Swal.fire("Deleted!", "Teacher deleted successfully.", "success");
              setReloadTrigger(Date.now());
            } else if (
              result.message?.toLowerCase().includes("relation") ||
              result.message?.toLowerCase().includes("lié")
            ) {
              // Deuxième alerte pour la suppression forcée
              const forceResult = await Swal.fire({
                title: "Teacher has related data",
                text: "Teacher has relations with other entities. Do you want to force delete?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, force delete",
                cancelButtonText: "Cancel",
              });

              if (forceResult.isConfirmed) {
                const forcedDelete = await deleteTeacher(
                  teacher._id,
                  true,
                  token
                );
                if (
                  forcedDelete.message?.toLowerCase().includes("succès") ||
                  forcedDelete.message?.toLowerCase().includes("success")
                ) {
                  Swal.fire(
                    "Deleted!",
                    "Teacher force-deleted successfully.",
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
          text="Add teacher"
          icon={<MdAddCircleOutline />}
          color="green"
          onClick={() => {
            setShowForm(true);
            setCurrentTeacher(null);
          }}
        />

        <Button
          text="Import teachers"
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

      {showForm && currentTeacher && (
        <TeacherUpdateForm
          teacher={currentTeacher}
          onSuccess={() => {
            setShowForm(false);
            setCurrentTeacher(null);
            setReloadTrigger(Date.now()); // Force reload
          }}
          onCancel={() => {
            setShowForm(false);
            setCurrentTeacher(null);
          }}
        />
      )}

      {showForm && !currentTeacher && (
        <TeacherForm
          onSuccess={() => {
            setShowForm(false);
            setReloadTrigger(Date.now());
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {showPasswordForm && currentTeacher && (
        <PasswordTeacher
          teacherId={currentTeacher._id}
          onSuccess={() => {
            setShowPasswordForm(false);
            setCurrentTeacher(null);
            Swal.fire({
              title: "Success",
              text: "Password updated successfully!",
              icon: "success",
            });
          }}
          onCancel={() => {
            setShowPasswordForm(false);
            setCurrentTeacher(null);
          }}
        />
      )}

      <GenericList
        title="Teachers list"
        fetchItems={stableFetchTeachers}
        reloadKey={reloadTrigger} // Ceci déclenchera le rechargement quand reloadTrigger change
        columns={[
          { key: "cin", header: "CIN" },
          { key: "firstName", header: "First Name" },
          { key: "lastName", header: "Last Name" },
          { key: "email", header: "Email" },
          { key: "actions", header: "Actions" },
        ]}
        customRenderers={{
          actions: (teacher) => (
            <ManageIconsTeacher
              teacher={teacher}
              onAction={handleActionClick}
            />
          ),
        }}
        searchFields={["cin", "firstName", "lastName", "email"]}
      />
    </div>
  );
};

export default ManageTeachers;
