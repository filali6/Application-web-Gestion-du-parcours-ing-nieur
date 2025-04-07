import React, { useState } from 'react';
import { Row, Col, Alert, Button } from 'react-bootstrap';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { loginUnified } from '../../../services/auth.service';
import { useAuth } from '../../../contexts/AuthContext';

const JWTLogin = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');
  const { setUser } = useAuth();

  return (
    <Formik
      initialValues={{ identifier: '', password: '', submit: null }}
      validationSchema={Yup.object().shape({
        identifier: Yup.string().required('CIN or Email is required'),
        password: Yup.string().max(255).required('Password is required')
      })}
      onSubmit={async (values, { setSubmitting }) => {
        setSubmitError('');
        try {
          const result = await loginUnified(values);
          const { token, user } = result;
          const decoded = JSON.parse(atob(token.split('.')[1]));
          const role = decoded.role;

          setUser({
            name: role === 'admin' ? 'Admin' : `${user.firstName} ${user.lastName}`,
            role
          });

          navigate('/dashboard');
        } catch (error) {
          setSubmitError(error.response?.data?.message || 'Login failed');
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              className="form-control"
              placeholder="Email or CIN"
              name="identifier"
              onBlur={handleBlur}
              onChange={handleChange}
              type="text"
              value={values.identifier}
            />
            {touched.identifier && errors.identifier && <small className="text-danger form-text">{errors.identifier}</small>}
          </div>

          <div className="form-group mb-4">
            <input
              className="form-control"
              placeholder="Password"
              name="password"
              onBlur={handleBlur}
              onChange={handleChange}
              type="password"
              value={values.password}
            />
            {touched.password && errors.password && <small className="text-danger form-text">{errors.password}</small>}
          </div>

          {submitError && (
            <Col sm={12}>
              <Alert variant="danger">{submitError}</Alert>
            </Col>
          )}

          <Row>
            <Col>
              <Button className="btn-block mb-4" disabled={isSubmitting} type="submit" variant="primary">
                Sign in
              </Button>
            </Col>
          </Row>
        </form>
      )}
    </Formik>
  );
};

export default JWTLogin;
