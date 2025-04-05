import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import SearchBar from "../Fields/SearchBar";

import SearchBar from "./../Fields/SearchBar";
import GenericTable from "./GenericTable";

const GenericList = ({
  title,

  items: externalItems, // ✅ Ajout de la prop `items

  fetchItems,
  columns,
  statusMap,
  customRenderers,
  searchFields = [],
  additionalFilters = null,
  noItemsMessage = "No items found",
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await fetchItems(filterValues, token);
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError(err.response?.data?.message || "Error fetching items");
        setItems([]);
        setLoading(false);
      }
    };

    fetchData();

  }, [externalItems, filterValues, fetchItems]); //

  useEffect(() => {
    if (externalItems) setItems(externalItems);
  }, [externalItems]);
  }, [filterValues, fetchItems]);


  const filteredItems = items.filter((item) => {
    if (!item) return false;
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return searchFields.some((field) =>
      String(item[field] || "")
        .toLowerCase()
        .includes(searchLower)
    );
  });

  const handleFilterChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div>Loading items...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <Card className="item-list">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title as="h5">{title}</Card.Title>
        <div className="d-flex">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          {additionalFilters && additionalFilters(handleFilterChange)}
        </div>
      </Card.Header>
      <Card.Body>
        <GenericTable
          items={filteredItems}
          columns={columns}
          statusMap={statusMap}
          customRenderers={customRenderers}
          noItemsMessage={noItemsMessage}
        />
      </Card.Body>
    </Card>
  );
};

export default GenericList;
