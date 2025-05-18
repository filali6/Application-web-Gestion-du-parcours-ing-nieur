import React, { useState, useEffect } from "react";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import GenericList from "../../../components/Generic/GenericList";
import SubjectDetailsModal from "./SubjectDetailsModal";
import { fetchSubjects } from "../../../services/subjects";

const MySubjects = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    level: "",
    semester: "",
  });

  const columns = [
    { key: "title", header: "Subject Name" },
    { key: "level", header: "Level" },
    { key: "semester", header: "Semester" },
    { key: "teacher", header: "Teacher" },
    { key: "actions", header: "Actions" },
  ];

  const customRenderers = {
    teacher: (item) => (
      <td>
        {item.assignedTeacher ? (
          <span>
            {item.assignedTeacher.firstName} {item.assignedTeacher.lastName}
          </span>
        ) : (
          <span className="text-muted">Not assigned</span>
        )}
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

  const fetchSubjectItems = async () => {
    try {
      const data = await fetchSubjects(filters);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="container py-4">
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

      <GenericList
        title="My Subjects"
        key={JSON.stringify(filters)}
        fetchItems={fetchSubjectItems}
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

export default MySubjects;
