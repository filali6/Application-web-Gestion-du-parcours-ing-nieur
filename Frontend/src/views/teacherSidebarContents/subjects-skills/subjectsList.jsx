import React, { useState, useEffect } from "react";
import { Tabs, Tab, Button, Form, Row, Col } from "react-bootstrap";
import GenericList from "../../../components/Generic/GenericList";
import SubjectDetailsModal from "./SubjectDetailsModal";
import { fetchSubjects } from "../../../services/subjects";
import { getSubjectDetails } from "../../../services/subjects.service";
import SkillsList from "./skillsList";

const MySkillsSubjects = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("subjects"); // Default to subjects tab
  const [filters, setFilters] = useState({
    level: "",
    semester: "",
  });

  // Subjects table configuration
  const subjectColumns = [
    { key: "title", header: "Subject Name" },
    { key: "level", header: "Level" },
    { key: "semester", header: "Semester" },
    { key: "actions", header: "Details" },
  ];

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleViewDetails = async (item) => {
    try {
      const fullDetails = await getSubjectDetails(item._id); // fetch subject by ID
      setSelectedSubject(fullDetails.subject); // assign subject from response
      setShowDetails(true);
    } catch (err) {
      console.error("Failed to fetch subject details:", err);
    }
  };

  const subjectRenderers = {
    actions: (item) => (
      <td>
        <Button
          variant="outline-info"
          size="sm"
          onClick={() => {
            setSelectedSubject(item); // Select subject
            setShowDetails(true); // Show modal
          }}
        >
          View Details
        </Button>
      </td>
    ),
  };

  const fetchSubjectItems = async () => {
    try {
      const data = await fetchSubjects(filters);
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
          <div className="mb-3">
            <Form>
              <Row>
                <Col md={2}>
                  <Form.Group controlId="filterLevel">
                    <Form.Label>Level</Form.Label>
                    <Form.Control
                      name="level"
                      value={filters.level}
                      onChange={handleFilterChange}
                      as="select"
                    >
                      <option value="">All</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      {/* Adapt as needed */}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group controlId="filterSemester">
                    <Form.Label>Semester</Form.Label>
                    <Form.Control
                      name="semester"
                      value={filters.semester}
                      onChange={handleFilterChange}
                      as="select"
                    >
                      <option value="">All</option>
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </div>

          <div className="mt-3">
            <GenericList
              title="My Subjects"
              fetchItems={fetchSubjectItems}
              columns={subjectColumns}
              customRenderers={subjectRenderers}
              searchFields={["title"]}
              noItemsMessage="No subjects assigned to you yet."
              key={JSON.stringify(filters)}
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
