import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import GenericList from "../../../components/Generic/GenericList";
import { fetchSkills } from "../../../services/skills";
import SkillDetailsModal from "./SkillDetailsModal";

const SkillsList = () => {
  const [selectedSkill, setSelectedSkill] = useState(null);

  const columns = [
    { key: "name", header: "Skill Name" },
    { key: "description", header: "Description" },
    { key: "subjects", header: "Related Subjects" },
  ];

  const customRenderers = {
    description: (description) => (
      <td
        style={{
          whiteSpace: "normal",
          wordWrap: "break-word",
          maxWidth: "500px",
        }}
      >
        {typeof description === "object"
          ? description.description || ""
          : description}
      </td>
    ),
    subjects: (item) => {
      const subjectsArray = Array.isArray(item.subjects) ? item.subjects : [];
      return (
        <td>
          <div className="subject-tags">
            {subjectsArray.length > 0 ? (
              subjectsArray.map((subject) => (
                <span key={subject.id} className="subject-tag">
                  {subject.title} ({subject.level})
                </span>
              ))
            ) : (
              <span className="text-muted">No subjects assigned</span>
            )}
          </div>
        </td>
      );
    },
  };

  const fetchItems = async () => {
    try {
      const data = await fetchSkills();
      return data;
    } catch (err) {
      console.error("Error fetching skills:", err);
      throw err;
    }
  };

  return (
    <div className="skills-container">
      <GenericList
        title="My Skills"
        fetchItems={fetchItems}
        columns={columns}
        customRenderers={customRenderers}
        searchFields={["name", "description"]}
        noItemsMessage="No subjects assigned yet!"
      />

      {selectedSkill && (
        <SkillDetailsModal
          skill={selectedSkill}
          show={showDetails}
          onHide={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default SkillsList;
