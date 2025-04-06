// components/Generic/GenericTable.jsx
import { Table } from "react-bootstrap";
<<<<<<< HEAD
import GenericRow from "./../Generic/GenericRow";
=======
import GenericRow from "./GenericRow";
>>>>>>> fc4f74dbfd5ae703c3b584233336af9b5f802564

const GenericTable = ({
  items,
  columns,
  statusMap,
  customRenderers,
  noItemsMessage = "No items found",
}) => (
  <Table responsive hover>
    <thead>
      <tr>
        {columns.map((column) => (
          <th key={column.key}>{column.header}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {items.length > 0 ? (
        items.map((item) => (
          <GenericRow
            key={item._id || item.id}
            item={item}
            columns={columns}
            statusMap={statusMap}
            customRenderers={customRenderers}
          />
        ))
      ) : (
        <tr>
          <td colSpan={columns.length} className="text-center">
            {noItemsMessage}
          </td>
        </tr>
      )}
    </tbody>
  </Table>
);

export default GenericTable;
