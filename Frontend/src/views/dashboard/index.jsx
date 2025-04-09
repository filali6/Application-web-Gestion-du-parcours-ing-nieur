import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { getDashboardCounts } from '../../services/dashboard.service';

const DashDefault = () => {
  const [counts, setCounts] = useState({
    students: 0,
    teachers: 0,
    skills: 0,
    subjects: 0
  });
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem('role'); // Get user role

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await getDashboardCounts();
        setCounts(data);
      } catch (err) {
        console.error('Failed to fetch dashboard counts', err);
      } finally {
        setLoading(false);
      }
    };

    if (role === 'admin') {
      fetchCounts(); // Only fetch if admin
    } else {
      setLoading(false); // No loading state for others
    }
  }, [role]);

  const dashboardItems = [
    { title: 'Total Students', value: counts.students, icon: 'users', color: 'primary' },
    { title: 'Total Teachers', value: counts.teachers, icon: 'user-check', color: 'success' },
    { title: 'Total Skills', value: counts.skills, icon: 'award', color: 'info' },
    { title: 'Total Subjects', value: counts.subjects, icon: 'layers', color: 'warning' }
  ];

  return (
    <div className="p-4">
      <h4 className="mb-4 fw-bold text-dark">📊 Dashboard Overview</h4>

      {role === 'admin' ? (
        <Row className="g-4">
          {loading ? (
            <div className="text-center py-5 w-100">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            dashboardItems.map((item, idx) => (
              <Col key={idx} md={6} xl={3}>
                <Card className={`shadow border-0 bg-${item.bg} rounded-3`}>
                  <Card.Body className="text-center py-4">
                    <div
                      className={`bg-${item.color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
                      style={{ width: 60, height: 60 }}
                    >
                      <i className={`feather icon-${item.icon} text-${item.color} f-30`} />
                    </div>
                    <h3 className="mb-1 fw-bold text-dark">{item.value}</h3>
                    <p className="text-muted mb-0 fw-medium">{item.title}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      ) : (
        <div className="d-flex flex-column align-items-center justify-content-center text-center py-5" style={{ minHeight: '60vh' }}>
          <div className="bg-white rounded shadow p-5" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="mb-3" style={{ fontSize: '3rem' }}>
              👋
            </div>
            <h2 className="fw-bold text-primary mb-3">Welcome to ISAMM University</h2>
            <p className="text-muted mb-0 fs-5">We&rsquo;re glad to have you on the platform.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashDefault;
