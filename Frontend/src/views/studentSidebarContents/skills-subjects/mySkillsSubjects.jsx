import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import GenericList from "./../../../components/Generic/GenericList";
import SubjectDetailsModal from "./SubjectDetailsModal";
import { fetchSubjects } from "./../../../services/subjects";

const MySkillsSubjects = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const columns = [
    { key: "title", header: "Subject Name" },
    { key: "level", header: "Level" },
    { key: "semester", header: "Semester" },
    { key: "assignedTeacher", header: "Teacher" },
    { key: "actions", header: "Actions" },
  ];

  const customRenderers = {
    assignedTeacher: (item) => (
      <td>
        {item.assignedTeacher
          ? `${item.assignedTeacher.firstName} ${item.assignedTeacher.lastName}`
          : "Not assigned"}{" "}
      </td>
    ),
    actions: (item) => (
      <td>
        <Button
          variant="outline-info"
          size="sm"
          onClick={() => {
            setSelectedSubject(item);
            setShowDetails(true);
          }}
        >
          View Details
        </Button>
      </td>
    ),
  };

  const fetchItems = async () => {
    try {
      const data = await fetchSubjects();
      // Map the data to include skill information if available
      return data
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="container py-4">
      <GenericList
        title="My Subjects"
        fetchItems={fetchItems}
        columns={columns}
        customRenderers={customRenderers}
        searchFields={["title"]}
        noItemsMessage="No subjects assigned to you yet."
      />

      {selectedSubject && (
        <SubjectDetailsModal
          subject={selectedSubject}
          show={showDetails}
          onHide={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default MySkillsSubjects;
