import React from "react";
import StatusBadge from "../Badges/StatusBadge";

const GenericRow = ({
  item,
  columns,
  statusMap = {},
  customRenderers = {},
}) => (
  <tr key={item._id || item.id}>
    {columns.map((column) => {
      // 1. Vérifie si un renderer personnalisé est fourni pour cette colonne
      if (customRenderers[column.key]) {
        return customRenderers[column.key](item);
      }

      // 2. Gestion spéciale pour les champs de statut avec statusMap
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

      // 3. Nouveau : Rendu inline fourni dans column (ex: pour Actions avec icônes)
      if (typeof column.render === "function") {
        return <td key={column.key}>{column.render(item)}</td>;
      }

      // 4. Rendu par défaut si aucune condition spécifique n'est remplie
      return <td key={column.key}>{item[column.key] || "_"}</td>;
    })}
  </tr>
);

export default GenericRow;
