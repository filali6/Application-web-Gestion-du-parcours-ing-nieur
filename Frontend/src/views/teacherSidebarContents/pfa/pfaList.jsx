import React, { useEffect, useState } from "react";
import { Table, Button, Space } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import { getMyPfas, deletePfa } from "../../../services/pfaService";
import AddPfaModal from "./pfaForm"; // Formulaire d'ajout de plusieurs PFAs
import EditPfaModal from "./editPfaForm"; // Formulaire de mise à jour

const PfaList = () => {
  const [pfas, setPfas] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPfa, setEditingPfa] = useState(null);

  useEffect(() => {
    fetchPfas();
  }, []);

  const fetchPfas = async () => {
    try {
      const response = await getMyPfas();
      setPfas(response.data.pfas);
    } catch (error) {
      Swal.fire("Erreur", "Impossible de récupérer les PFAs", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer !",
    });

    if (confirm.isConfirmed) {
      try {
        await deletePfa(id);
        Swal.fire("Supprimé !", "Le PFA a été supprimé.", "success");
        fetchPfas();
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          // Afficher l'erreur spécifique du backend
          Swal.fire("Erreur", error.response.data.error, "error");
        } else {
          // Message générique en cas d'erreur inattendue
          Swal.fire(
            "Erreur",
            "Impossible de supprimer le PFA. Veuillez réessayer.",
            "error"
          );
        }
      }
    }
  };

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Technologies", dataIndex: "technologies", key: "technologies" },
    { title: "Mode", dataIndex: "mode", key: "mode" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Student(s)",
      key: "students",
      render: (_, record) => {
        if (record.Students && record.Students.length > 0) {
          return record.Students.map(
            (student) => `${student.firstName} ${student.lastName}`
          ).join(", ");
        }
        return "Non attribué";
      },
    },
    {
      title: "Choice",
      key: "choices",
      render: (_, record) => {
        if (record.choices && record.choices.length > 0) {
          return (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {record.choices.map((choice, index) => {
                const student = choice.student;
                const fullName = student
                  ? `${student.firstName} ${student.lastName}`
                  : "Inconnu";

                const yesStyle = { color: "green", fontWeight: "bold" };
                const noStyle = { color: "red", fontWeight: "bold" };

                return (
                  <div
                    key={index}
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      borderRadius: "6px",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <strong>{fullName}</strong>
                    <br />
                    🎯 Priorité : {choice.priority}
                    <br />
                    👨‍🏫 Accepté :{" "}
                    <span style={choice.acceptedByTeacher ? yesStyle : noStyle}>
                      {choice.acceptedByTeacher ? "Oui" : "Non"}
                    </span>
                    <br />✅ Validé :{" "}
                    <span style={choice.validation ? yesStyle : noStyle}>
                      {choice.validation ? "Oui" : "Non"}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        }
        return "Aucun choix";
      },
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingPfa(record);
              setIsEditModalOpen(true);
            }}
            style={{ color: "#1890ff", borderColor: "#1890ff" }}
            title="Modifier"
          />

          <Button
            type="default"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            title="Supprimer"
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsAddModalOpen(true)}
        style={{ marginBottom: 16 }}
      >
        Ajouter PFAs
      </Button>

      <Table columns={columns} dataSource={pfas} rowKey="_id" />

      {/* Modal d'ajout */}
      <AddPfaModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRefresh={fetchPfas}
      />

      {/* Modal de mise à jour */}
      {editingPfa && (
        <EditPfaModal
          visible={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPfa(null);
          }}
          onRefresh={fetchPfas}
          editingPfa={editingPfa}
        />
      )}
    </>
  );
};

export default PfaList;
