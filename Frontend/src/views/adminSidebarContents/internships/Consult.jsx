import React, { useEffect, useState } from "react";
import { Table, Typography, Space, Spin, Alert, Tag, Button } from "antd";
import { getTopics } from "./serviceInternshipsAdmin";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Consult = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await getTopics();

        if (response.topics && response.topics.length > 0) {
          setTopics(response.topics);
          console.log("Topics reçus:", response.topics);
        } else {
          setError(response.message || "Aucun sujet trouvé.");
        }
      } catch (error) {
        setError("Une erreur est survenue lors de la récupération des sujets.");
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  // Fonction pour rediriger vers la page de détails du sujet
  const goToTopicDetails = (topic) => {
    // Stocker l'ID du sujet dans localStorage pour y accéder depuis la page de détails
    localStorage.setItem("selectedTopicId", topic._id || topic.id);
    console.log("ID du sujet stocké:", topic._id || topic.id);

    // Rediriger vers la page de détails
    navigate(`/internships/topic-status`);
  };

  // Définition des colonnes pour la table Ant Design
  const columns = [
    {
      title: "Sujet",
      dataIndex: "titre",
      key: "titre",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.titre.localeCompare(b.titre),
    },
    {
      title: "Nom de l'étudiant",
      dataIndex: "student",
      key: "studentName",
      render: (student) => {
        if (student && student.firstName && student.lastName) {
          return `${student.firstName} ${student.lastName}`;
        } else if (student && student.name) {
          return student.name;
        } else if (typeof student === "string") {
          return student;
        }
        return "N/A";
      },
      sorter: (a, b) => {
        const nameA = a.student?.lastName || a.student?.name || "";
        const nameB = b.student?.lastName || b.student?.name || "";
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: "Email de l'étudiant",
      dataIndex: "student",
      key: "studentEmail",
      render: (student) => {
        if (student && student.email) {
          return student.email;
        }
        return "N/A";
      },
    },
    {
      title: "Statut de soumission",
      key: "submissionStatus",
      render: (_, record) => {
        if (record.isLate === true) {
          return (
            <Tag icon={<ClockCircleOutlined />} color="orange">
              Late Submission
            </Tag>
          );
        } else if (record.isLate === false) {
          return (
            <Tag icon={<CheckCircleOutlined />} color="green">
              On-time Submission
            </Tag>
          );
        } else {
          return (
            <Tag icon={<ExclamationCircleOutlined />} color="default">
              Non soumis
            </Tag>
          );
        }
      },
      filters: [
        { text: "Late Submission", value: true },
        { text: "On-time Submission", value: false },
        { text: "Non soumis", value: null },
      ],
      onFilter: (value, record) => {
        if (value === null) {
          return record.isLate === undefined;
        }
        return record.isLate === value;
      },
      sorter: (a, b) => {
        const valueA = a.isLate === undefined ? 2 : a.isLate ? 1 : 0;
        const valueB = b.isLate === undefined ? 2 : b.isLate ? 1 : 0;
        return valueA - valueB;
      },
    },
    {
      title: "Suivi du sujet",
      key: "followUp",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => goToTopicDetails(record)}
          size="middle"
        >
          Voir détails
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "8px" }}>
      <Title level={3} style={{ marginBottom: "24px" }}>
        Liste des Sujets de Stage
      </Title>

      {loading ? (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert message="Erreur" description={error} type="error" showIcon />
      ) : (
        <Table
          columns={columns}
          dataSource={topics.map((topic) => ({
            ...topic,
            key: topic._id || topic.id,
          }))}
          pagination={{ pageSize: 10 }}
          bordered
          style={{ backgroundColor: "white", borderRadius: "8px" }}
          loading={loading}
          scroll={{ x: true }}
        />
      )}
    </div>
  );
};

export default Consult;
