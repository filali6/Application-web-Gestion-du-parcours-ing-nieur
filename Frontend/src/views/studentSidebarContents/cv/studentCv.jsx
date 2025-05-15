import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentCV.scss";
import { getCV, updateCV } from "services/student";
import Loader from "components/Loader/Loader";
import Swal from "sweetalert2";

const StudentCV = () => {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    diplomas: [],
    languages: [],
    experiences: [],
    certifications: [],
  });
  const [initialFormData, setInitialFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getCV(token);

        if (data === null) {
          setCvData(null);
        } else {
          setCvData(data);
          const initialData = {
            diplomas: data.diplomas || [],
            languages: data.languages || [],
            experiences: data.experiences || [],
            certifications: data.certifications || [],
          };
          setFormData(initialData);
          setInitialFormData(JSON.parse(JSON.stringify(initialData)));
        }
      } catch (err) {
        setError("Failed to load CV");
        console.error("Error fetching CV:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, []);

  const validateYear = (year) => {
    if (!year) return false;
    const yearNum = parseInt(year);
    return !isNaN(yearNum) && yearNum <= currentYear;
  };

  const handleInputChange = (section, index, field, value) => {
    if (field === "year" && !validateYear(value)) {
      setErrors({
        ...errors,
        [`${section}-${index}-${field}`]: `Year must be valid and not greater than ${currentYear}`,
      });
      return;
    } else {
      const newErrors = { ...errors };
      delete newErrors[`${section}-${index}-${field}`];
      setErrors(newErrors);
    }

    const updatedSection = [...formData[section]];
    updatedSection[index] = { ...updatedSection[index], [field]: value };
    setFormData({ ...formData, [section]: updatedSection });
  };

  const handleAddItem = (section) => {
    const newItem = {};
    switch (section) {
      case "diplomas":
        newItem.title = "";
        newItem.year = "";
        break;
      case "languages":
        newItem.name = "";
        break;
      case "experiences":
        newItem.title = "";
        newItem.description = "";
        newItem.periode = "";
        break;
      case "certifications":
        newItem.name = "";
        newItem.year = "";
        break;
      default:
        break;
    }
    setFormData({
      ...formData,
      [section]: [...formData[section], newItem],
    });
  };

  const handleRemoveItem = (section, index) => {
    const updatedSection = [...formData[section]];
    updatedSection.splice(index, 1);
    setFormData({ ...formData, [section]: updatedSection });

    const newErrors = { ...errors };
    Object.keys(newErrors).forEach((key) => {
      if (key.startsWith(`${section}-${index}-`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const hasChanges = () => {
    if (!initialFormData) return true;
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };

  const getEmptyFields = () => {
    const emptyFields = [];
    const sections = ["diplomas", "languages", "experiences", "certifications"];

    sections.forEach((section) => {
      formData[section].forEach((item, index) => {
        if (section === "diplomas") {
          if (!item.title || item.title.trim() === "")
            emptyFields.push(`Diploma ${index + 1} Title`);
          if (!item.year || item.year.toString().trim() === "")
            emptyFields.push(`Diploma ${index + 1} Year`);
        }
        if (
          section === "languages" &&
          (!item.name || item.name.trim() === "")
        ) {
          emptyFields.push(`Language ${index + 1} Name`);
        }
        if (section === "experiences") {
          if (!item.title || item.title.trim() === "")
            emptyFields.push(`Experience ${index + 1} Title`);
          if (!item.periode || item.periode.trim() === "")
            emptyFields.push(`Experience ${index + 1} Period`);
        }
        if (section === "certifications") {
          if (!item.name || item.name.trim() === "")
            emptyFields.push(`Certification ${index + 1} Name`);
          if (!item.year || item.year.toString().trim() === "")
            emptyFields.push(`Certification ${index + 1} Year`);
        }
      });
    });

    return emptyFields;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if there are any changes
    if (!hasChanges()) {
      Swal.fire({
        title: "No Changes Detected",
        text: "You haven't made any changes to save.",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }

    // Check for empty fields
    const emptyFields = getEmptyFields();
    if (emptyFields.length > 0) {
      Swal.fire({
        title: "Missing Information",
        html: `Please complete all fields before saving.<br><br>
               <strong>Missing fields:</strong><br>${emptyFields.join("<br>")}`,
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Check for validation errors
    if (Object.keys(errors).length > 0) {
      Swal.fire({
        title: "Validation Errors",
        text: "Please correct the highlighted errors before saving.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await updateCV(formData, token);

      setCvData({
        ...cvData,
        diplomas: formData.diplomas,
        languages: formData.languages,
        experiences: formData.experiences,
        certifications: formData.certifications,
      });

      setInitialFormData(JSON.parse(JSON.stringify(formData)));
      setEditMode(false);
      setError(null);

      Swal.fire({
        title: "Success",
        text: "CV updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (err) {
      console.error("Error updating CV:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to update CV. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const renderEditableSection = (title, items, fields) => {
    if (editMode) {
      return (
        <div className="cv-section">
          <h3>{title}</h3>
          {items.map((item, index) => (
            <div key={index} className="edit-item">
              {fields.map((field) => {
                const errorKey = `${title.toLowerCase()}-${index}-${field.name}`;
                return (
                  <div key={field.name} className="form-group">
                    <label>{field.label}</label>
                    <input
                      type={field.type || "text"}
                      value={item[field.name] || ""}
                      onChange={(e) =>
                        handleInputChange(
                          title.toLowerCase(),
                          index,
                          field.name,
                          e.target.value
                        )
                      }
                      className={errors[errorKey] ? "input-error" : ""}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                    {errors[errorKey] && (
                      <div className="error-message">{errors[errorKey]}</div>
                    )}
                  </div>
                );
              })}
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleRemoveItem(title.toLowerCase(), index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleAddItem(title.toLowerCase())}
          >
            Add {title.slice(0, -1)}
          </button>
        </div>
      );
    } else {
      return (
        <div className="cv-section">
          <h3>{title}</h3>
          {items?.length > 0 ? (
            <ul className="items-list">
              {items.map((item, index) => (
                <li key={index} className="item">
                  {fields.map((field) => (
                    <span key={field.name}>
                      {item[field.name]} {field.separator || ""}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-items">No {title.toLowerCase()} listed</p>
          )}
        </div>
      );
    }
  };

  const renderReadOnlySection = (title, items, itemRenderer) => (
    <section className="cv-section">
      <h3>{title}</h3>
      {items?.length > 0 ? (
        <ul className="items-list">
          {items.map((item, index) => (
            <li key={index} className="item">
              {itemRenderer(item)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-items">No {title.toLowerCase()} listed</p>
      )}
    </section>
  );

  if (loading) return <Loader />;
  if (error) return <div className="error">{error}</div>;
  if (!cvData) return <div className="not-found">CV not found</div>;

  return (
    <div className="cv-container">
      <header className="cv-header">
        <h1>
          {cvData.student.firstName} {cvData.student.lastName}
        </h1>
        <div className="cv-actions">
          {editMode ? (
            <>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleSubmit}
                disabled={Object.keys(errors).length > 0}
              >
                Save Changes
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setErrors({});
                  setFormData(JSON.parse(JSON.stringify(initialFormData)));
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => setEditMode(true)}
            >
              Edit CV
            </button>
          )}
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="cv-sections">
        {renderReadOnlySection("Skills", cvData.skills, (skill) => skill.name)}

        {renderReadOnlySection(
          "Internships",
          cvData.topics,
          (topic) =>
            `${topic.titre} - ${topic.company || ""} - ${topic.description || ""}`
        )}

        {cvData.pfa && (
          <section className="cv-section">
            <h3>PFA</h3>
            <div className="project-details">
              <p>
                <strong>Title:</strong> {cvData.pfa.title}
              </p>
              <p>
                <strong>Technologies:</strong>{" "}
                {cvData.pfa.technologies?.join(", ")}
              </p>
              <p>
                <strong>Year:</strong> {cvData.pfa.year}
              </p>
            </div>
          </section>
        )}

        {cvData.pfe && (
          <section className="cv-section">
            <h3>PFE</h3>
            <div className="project-details">
              <p>
                <strong>Title:</strong> {cvData.pfe.title}
              </p>
              <p>
                <strong>Company:</strong> {cvData.pfe.nameCompany}
              </p>
              <p>
                <strong>Technologies:</strong>{" "}
                {cvData.pfe.technologies?.join(", ")}
              </p>
              <p>
                <strong>Year:</strong> {cvData.pfe.year}
              </p>
            </div>
          </section>
        )}

        {renderEditableSection("Diplomas", formData.diplomas, [
          { name: "title", label: "Title" },
          { name: "year", label: "Year", type: "number" },
        ])}

        {renderEditableSection("Languages", formData.languages, [
          { name: "name", label: "Language" },
        ])}

        {renderEditableSection("Experiences", formData.experiences, [
          { name: "title", label: "Title" },
          { name: "description", label: "Description" },
          { name: "periode", label: "Period" },
        ])}

        {renderEditableSection("Certifications", formData.certifications, [
          { name: "name", label: "Name" },
          { name: "year", label: "Year", type: "number" },
        ])}
      </div>
    </div>
  );
};

export default StudentCV;
