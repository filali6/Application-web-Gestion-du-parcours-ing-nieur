import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectForm from "./ProjectForm";
import { getTopics } from "services/internshipservicesstudent";
import { Container, Spinner } from "react-bootstrap";
import { Card, Typography, Space, List, Button, Tag } from "antd";
import {
  SolutionOutlined,
  PlusOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const MyInternships = () => {
  const [showForm, setShowForm] = useState(false);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const data = await getTopics();
      setTopics(data.topics);
    } catch (error) {
      console.error("Erreur lors du chargement des sujets :", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  // Fonction pour naviguer vers la page de détails
  const goToTopicDetails = (topic) => {
    // Stocker l'ID du sujet sélectionné dans localStorage
    localStorage.setItem("selectedTopicId", topic._id || topic.id);
    console.log("ID du sujet stocké:", topic._id || topic.id);
    navigate(`/internships/details/`);
    // Pour déboguer
    console.log("Tentative de navigation vers /internships/details/");
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2} style={{ marginBottom: "24px" }}>
        <SolutionOutlined /> My Internships
      </Title>

      {/* Bouton d'ajout */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<PlusOutlined />}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "60px",
          height: "60px",
          fontSize: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={toggleForm}
      />

      {showForm && (
        <ProjectForm onTopicAdded={loadTopics} onClose={toggleForm} />
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spinner animation="border" />
        </div>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
          dataSource={topics || []}
          locale={{ emptyText: "No topics found" }}
          renderItem={(topic) => (
            <List.Item>
              <Card
                title={
                  <Space>
                    <Text strong>{topic.titre}</Text>
                    {topic.isLate !== undefined && (
                      <Tag
                        color={topic.isLate ? "orange" : "green"}
                        icon={
                          topic.isLate ? (
                            <ClockCircleOutlined />
                          ) : (
                            <CheckCircleOutlined />
                          )
                        }
                      >
                        {topic.isLate
                          ? "Late Submission"
                          : "On-time Submission"}
                      </Tag>
                    )}
                  </Space>
                }
                hoverable // Ajoute un effet hover pour indiquer que c'est cliquable
                onClick={() => goToTopicDetails(topic)} // Fonction de navigation simplifiée
                style={{
                  marginBottom: "16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                actions={[
                  <div key="view-details">
                    <RightOutlined /> View Details
                  </div>,
                ]}
              >
                <Text>
                  Click to track the status of your summer internship topic
                </Text>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default MyInternships;
