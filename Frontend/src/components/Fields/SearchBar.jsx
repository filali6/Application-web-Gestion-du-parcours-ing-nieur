import { Form, Row, Col, Button } from 'react-bootstrap';

const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <Form.Group as={Row} className="mb-0 me-3">
    <Col xs="auto">
      <Form.Control
        type="text"
        placeholder="Search students..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </Col>
  </Form.Group>
);

export default SearchBar;