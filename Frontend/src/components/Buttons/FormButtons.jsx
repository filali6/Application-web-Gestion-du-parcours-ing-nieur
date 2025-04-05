import React from "react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";

const FormButtons = ({ isSubmitting, onCancel, isEditMode }) => (
  <div className="d-flex justify-content-end mt-4 pe-4">
    <Button
      variant="outline-secondary"
      onClick={onCancel}
      type="button"
      className="btn btn-outline-secondary theme-bg2 f-12 rounded-pill px-3 me-2"
    >
      Cancel
    </Button>
    <Button
      variant="primary"
      type="submit"
      className="btn theme-bg text-white f-12 rounded-pill px-3"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-1"
            role="status"
            aria-hidden="true"
          ></span>
          Processing...
        </>
      ) : isEditMode ? (
        "Update"
      ) : (
        "Create"
      )}
    </Button>
  </div>
);

FormButtons.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool.isRequired,
};

export default FormButtons;