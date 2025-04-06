<<<<<<< HEAD
import { Form, Row, Col, Button } from 'react-bootstrap';
=======
import { Form, Row, Col, Button } from "react-bootstrap";
>>>>>>> fc4f74dbfd5ae703c3b584233336af9b5f802564

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

<<<<<<< HEAD
export default SearchBar;
=======
export default SearchBar;
>>>>>>> fc4f74dbfd5ae703c3b584233336af9b5f802564
