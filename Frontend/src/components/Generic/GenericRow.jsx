import StatusBadge from "./../Badges/StatusBadge";

const GenericRow = ({ 
  item, 
  columns, 
  statusMap = {}, 
  customRenderers = {} 
}) => (
  <tr key={item._id || item.id}>
    {columns.map((column) => {
      // Check if there's a custom renderer for this column
      if (customRenderers[column.key]) {
        return customRenderers[column.key](item);
      }
      
      // Special handling for status fields with statusMap
      if (column.key === 'status' && statusMap[item.status]) {
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
      
      // Default rendering
      return <td key={column.key}>{item[column.key] || "_"}</td>;
    })}
  </tr>
);

export default GenericRow;