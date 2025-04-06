import React from "react";
import { Table } from "react-bootstrap";
import PropTypes from "prop-types";
import PeriodTableRow from "./PeriodTableRow";

const PeriodTable = ({ periods, onEdit }) => {
  return (
    <div className="card">
      <style jsx>{`
        .custom-badge {
          background-color: #ff7659 !important;
          color: #fff !important;
        }
      `}</style>

      <div className="card-block">
        <div className="table-responsive">
          <Table hover className="list-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {periods.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    <div className="p-3">No periods found</div>
                  </td>
                </tr>
              ) : (
                periods.map((period) => (
                  <PeriodTableRow
                    key={period._id}
                    period={period}
                    onEdit={onEdit}
                  />
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

PeriodTable.propTypes = {
  periods: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      StartDate: PropTypes.string.isRequired,
      EndDate: PropTypes.string.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default PeriodTable;