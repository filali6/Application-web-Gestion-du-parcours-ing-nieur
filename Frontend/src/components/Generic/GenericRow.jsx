import React from "react";
import StatusBadge from "./../Badges/StatusBadge";

const GenericRow = ({
  item,
  columns,
  statusMap = {},
  customRenderers = {},
}) => (
  <tr key={item._id || item.id}>
    {columns.map((column) => {
      // 1. Custom renderer (prioritaire)
      if (customRenderers[column.key]) {
        return customRenderers[column.key](item);
      }

      // 2. Nouveau : Render inline fourni dans column (ex: pour Actions avec icônes)
      if (typeof column.render === "function") {
        return <td key={column.key}>{column.render(item)}</td>;
      }

      // 3. Gestion spéciale du statut avec badge
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

      // 4. Affichage par défaut
      return <td key={column.key}>{item[column.key] || "_"}</td>;
    })}
  </tr>
);

export default GenericRow;
