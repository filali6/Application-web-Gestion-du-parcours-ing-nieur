import React, { useState } from "react";
import { Tabs, Tab, Button } from "react-bootstrap";
import GenericList from "../../../components/Generic/GenericList";
import SubjectDetailsModal from "../../studentSidebarContents/skills-subjects/SubjectDetailsModal";
import { fetchSubjects } from "../../../services/subjects";
import SkillsList from "./skillsList";

const MySkillsSubjects = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("subjects"); // Default to subjects tab

  // Subjects table configuration
  const subjectColumns = [
    { key: "title", header: "Subject Name" },
    { key: "level", header: "Level" },
    { key: "semester", header: "Semester" },
    { key: "actions", header: "Details" },
  ];

  const subjectRenderers = {

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

  const fetchSubjectItems = async () => {
    try {
      const data = await fetchSubjects();
      return data;
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="container py-4">
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        id="skills-subjects-tabs"
        className="mb-4"
      >
        <Tab eventKey="subjects" title="My Subjects">
          <div className="mt-3">
            <GenericList
              title="My Subjects"
              fetchItems={fetchSubjectItems}
              columns={subjectColumns}
              customRenderers={subjectRenderers}
              searchFields={["title"]}
              noItemsMessage="No subjects assigned to you yet."
            />
          </div>
        </Tab>
        <Tab eventKey="skills" title="My Skills">
          <div className="mt-3">
            <SkillsList />
          </div>
        </Tab>
      </Tabs>

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