<<<<<<< HEAD
import React from "react";
import StatusBadge from "./../Badges/StatusBadge";
=======
import StatusBadge from "../Badges/StatusBadge";
>>>>>>> fc4f74dbfd5ae703c3b584233336af9b5f802564

const GenericRow = ({
  item,
  columns,
  statusMap = {},
  customRenderers = {},
}) => (
  <tr key={item._id || item.id}>
    {columns.map((column) => {
<<<<<<< HEAD
      // 1. Custom renderer (prioritaire)
=======
      // Check if there's a custom renderer for this column
>>>>>>> fc4f74dbfd5ae703c3b584233336af9b5f802564
      if (customRenderers[column.key]) {
        return customRenderers[column.key](item);
      }

<<<<<<< HEAD
      // 2. Nouveau : Render inline fourni dans column (ex: pour Actions avec icônes)
      if (typeof column.render === "function") {
        return <td key={column.key}>{column.render(item)}</td>;
      }

      // 3. Gestion spéciale du statut avec badge
=======
      // Special handling for status fields with statusMap
>>>>>>> fc4f74dbfd5ae703c3b584233336af9b5f802564
      if (column.key === "status" && statusMap[item.status]) {
        return (
          <td key={column.key}>
            <StatusBadge
              status={
                statusMap[item.status] || {
                  variant: "secondary",
                  label: item.status,
                }
              }
            />
          </td>
        );
      }

<<<<<<< HEAD
      // 4. Affichage par défaut
=======
      // Default rendering
>>>>>>> fc4f74dbfd5ae703c3b584233336af9b5f802564
      return <td key={column.key}>{item[column.key] || "_"}</td>;
    })}
  </tr>
);

export default GenericRow;
