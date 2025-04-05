import React from "react";
import { format } from "date-fns";
import PropTypes from "prop-types";
import PeriodBadge from "./../../../components/Badges/PeriodBadge";
import StatusBadge from "./../../../components/Badges/StatusBadge";
import EditButton from "./../../../components/Buttons/EditButton";
import { periodTypeInfo } from "./constants";

const PeriodTableRow = ({ period, onEdit }) => {
  const getStatusInfo = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now > end) return { label: "Closed", variant: "danger" };
    if (now >= start) return { label: "Open", variant: "success" };
    return { label: "Coming Soon", variant: "warning" };
  };


  const status = getStatusInfo(period.StartDate, period.EndDate);

  return (
    <tr key={period._id}>
      <td>
        <div className="d-inline-block align-middle">
          <div className="d-inline-block">
            <PeriodBadge type={period.type} periodTypes={periodTypeInfo} />
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
        <StatusBadge status={status} />
      </td>
      <td className="text-right">
        <EditButton onClick={() => onEdit(period)} title="Edit" />
      </td>
    </tr>
  );
};

PeriodTableRow.propTypes = {
  period: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    StartDate: PropTypes.string.isRequired,
    EndDate: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default PeriodTableRow;