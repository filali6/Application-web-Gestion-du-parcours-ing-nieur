import React from "react";
import { Table, Button, Badge } from "react-bootstrap";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const PeriodTable = ({ periods, onEdit }) => {
  // Define type to label and color mapping
  const typeInfo = {
    pfa: { label: "PFA for Teachers", color: "theme-bg" },
    stageEte: { label: "Summer Internship", color: "theme-bg2" },
    choicePFA: { label: "PFA for Students",  color: "custom-badge" },
  };

  const getStatusInfo = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now > end) return { status: "Closed", variant: "danger" };
    if (now >= start) return { status: "Open", variant: "success" };
    return { status: "Coming Soon", variant: "warning" };
  };

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
                periods.map((period) => {
                  const { status, variant } = getStatusInfo(
                    period.StartDate,
                    period.EndDate
                  );
                  const typeData = typeInfo[period.type] || {
                    label: period.type,
                    color: "secondary",
                  };

                  return (
                    <tr key={period._id}>
                      <td>
                        <div className="d-inline-block align-middle">
                          <div className="d-inline-block">
                            <Badge
                              pill
                              className={`text-capitalize text-white ${typeData.color}`}
                              style={{
                                padding: "0.35rem 0.75rem",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                              }}
                            >
                              {typeData.label}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-muted">
                          {format(new Date(period.StartDate), "yyyy-MM-dd")}
                        </div>
                      </td>
                      <td>
                        <div className="text-muted">
                          {format(new Date(period.EndDate), "yyyy-MM-dd")}
                        </div>
                      </td>
                      <td>
                        <Badge pill bg={variant} className="text-capitalize">
                          {status}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <Link
                          to="#"
                          className="btn btn-icon btn-sm rounded-pill"
                          onClick={(e) => {
                            e.preventDefault();
                            onEdit(period);
                          }}
                          style={{
                            color: "#1cdcc8",
                            borderColor: "#1cdcc8",
                            backgroundColor: "transparent",
                            transition: "all 0.3s ease",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.color = "#fff";
                            e.currentTarget.style.backgroundColor = "#1cdcc8";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.color = "#1cdcc8";
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                          title="Edit"
                        >
                          <i className="feather icon-edit"></i>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PeriodTable;
