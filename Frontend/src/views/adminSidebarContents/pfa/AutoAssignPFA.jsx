import React, { useEffect, useState } from "react";
import { Table, Button, Typography, message, Spin } from "antd";
import { fetchPFAs, autoAssignPFAs } from "../../../services/pfaService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title } = Typography;

const AutoAssignPFA = () => {
  const [pfas, setPfas] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPFAs();
        const published = data.filter((pfa) => pfa.status === "published");
        setPfas(published);
      } catch (error) {
        message.error("Erreur de chargement des PFAs");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAutoAssign = async () => {
    if (selectedRowKeys.length === 0) {
      return Swal.fire(
        "Alerte",
        "Veuillez sélectionner au moins un PFA",
        "warning"
      );
    }

    Swal.fire({
      title: "Confirmer l’affectation automatique ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const result = await autoAssignPFAs(
            selectedRowKeys.map((id) => id.toString())
          );

          Swal.fire("Succès", "Affectation automatique effectuée", "success");
          navigate("/pfa/validate-pfa");
        } catch (error) {
          const resData = error.response?.data;

          if (resData?.errors && Array.isArray(resData.errors)) {
            const messages = resData.errors
              .map((err) => {
                return `🔸 <b>${err.title}</b> - Étudiant: <code>${err.student || "N/A"}</code><br/>⚠️ ${err.message}`;
              })
              .join("<hr/>");

            Swal.fire({
              title: "Erreurs lors de l’affectation",
              html: `<div style="text-align:left">${messages}</div>`,
              icon: "error",
              width: 600,
            });
          } else {
            Swal.fire(
              "Erreur",
              "Une erreur s'est produite. Veuillez réessayer.",
              "error"
            );
          }
        }
      }
    });
  };

  const columns = [
    {
      title: "Titre",
      dataIndex: "title",
      key: "title",
    },
    // {
    //   title: "Enseignant",
    //   dataIndex: "teacher",
    //   key: "teacher",
    //   render: (teacher) => teacher?.name || "Non spécifié",
    // },
    {
      title: "Année",
      dataIndex: "year",
      key: "year",
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/pfa/validate-pfa")}
        style={{ marginBottom: 16, paddingLeft: 0 }}
      >
        Retour à la validation
      </Button>

      <Title level={3}>
        Sélectionner les PFAs pour l’Affectation Automatique
      </Title>
      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <Table
            rowSelection={{
              selectedRowKeys,
              onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
            }}
            dataSource={pfas.map((pfa) => ({
              key: pfa._id,
              ...pfa,
            }))}
            columns={columns}
            pagination={{ pageSize: 6 }}
          />
          <Button
            type="primary"
            onClick={handleAutoAssign}
            disabled={selectedRowKeys.length === 0}
            style={{ marginTop: 16 }}
          >
            Confirmer l’Affectation Automatique
          </Button>
        </>
      )}
    </div>
  );
};

export default AutoAssignPFA;
