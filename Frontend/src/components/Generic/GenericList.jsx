import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import SearchBar from "../Fields/SearchBar";
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
  reloadKey,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState({});

 // useEffect pour récupérer les données via l'API (fetch)
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const data = await fetchItems(filterValues, token);
      setItems(Array.isArray(data) ? data : []); // Mise à jour des items récupérés
    } catch (err) {
      console.error("Error:", err);
      setError(err?.response?.data?.message || "Error fetching items");
      setItems([]); // En cas d'erreur, réinitialise les items
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [filterValues, fetchItems, reloadKey]); // Ce useEffect est responsable de la récupération des données

// useEffect pour mettre à jour `items` si `externalItems` change
useEffect(() => {
  if (externalItems && externalItems.length) {
    setItems(externalItems); // Si externalItems change, met à jour items
  }
}, [externalItems]); // Ce useEffect se déclenche uniquement quand externalItems change


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
