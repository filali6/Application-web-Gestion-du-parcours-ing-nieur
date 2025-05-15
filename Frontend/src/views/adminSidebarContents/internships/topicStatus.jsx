import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Space, Button, Empty, Divider, Spin,Tag } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
  FileOutlined,
  InfoCircleOutlined,
  MailOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { getAllPV, getPlans, getTopics } from "./serviceInternshipsAdmin"; // Assurez-vous que le chemin est correct

const { Title, Text } = Typography;

const TopicStatus = () => {
  const navigate = useNavigate();
  const [topicDetails, setTopicDetails] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [pvDetails, setPvDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTopicAndPlanDetails();
  }, []);

  const loadTopicAndPlanDetails = async () => {
    try {
      setLoading(true);

      // Récupérer l'ID du sujet à partir du localStorage
      const selectedTopicId = localStorage.getItem("selectedTopicId");

      if (!selectedTopicId) {
        setError("Aucun sujet sélectionné");
        setLoading(false);
        return;
      }

      // Récupérer tous les sujets, plans et PVs en parallèle
      const [topicsResponse, plansResponse, pvResponse] = await Promise.all([
        getTopics(),
        getPlans(),
        getAllPV(), // Récupération des PVs
      ]);

      if (!topicsResponse.topics || topicsResponse.topics.length === 0) {
        setError("Aucun sujet trouvé");
        setLoading(false);
        return;
      }

      // Trouver le sujet correspondant à l'ID sélectionné
      const topic = topicsResponse.topics.find(
        (t) => t._id === selectedTopicId || t.id === selectedTopicId
      );

      if (!topic) {
        setError("Sujet sélectionné non trouvé");
        setLoading(false);
        return;
      }

      console.log("Sujet trouvé:", topic);
      setTopicDetails(topic);
      // Vérifier si des plans sont disponibles
      if (
        plansResponse &&
        plansResponse.plans &&
        plansResponse.plans.length > 0
      ) {
        console.log("Plans disponibles:", plansResponse.plans);

        // Trouver le plan correspondant au sujet sélectionné
        const matchingPlan = plansResponse.plans.find(
          (plan) =>
            plan.sujet?._id === selectedTopicId ||
            plan.sujet === selectedTopicId ||
            (plan.sujet && plan.sujet._id === selectedTopicId)
        );

        if (matchingPlan) {
          console.log("Plan correspondant trouvé:", matchingPlan);
          setPlanDetails(matchingPlan);
        } else {
          console.log(
            "Aucun plan correspondant trouvé pour le sujet:",
            selectedTopicId
          );
        }
      } else {
        console.log("Aucun plan disponible");
      }
      // Vérifier si des PVs sont disponibles
      if (
        pvResponse &&
        pvResponse.pvDetails &&
        pvResponse.pvDetails.length > 0
      ) {
        console.log("PVs disponibles:", pvResponse.pvDetails);

        // Trouver le PV correspondant au sujet sélectionné
        const matchingPV = pvResponse.pvDetails.find(
          (pv) => pv.sujetId === selectedTopicId
        );

        if (matchingPV) {
          console.log("PV correspondant trouvé:", matchingPV);
          setPvDetails(matchingPV);
        } else {
          console.log(
            "Aucun PV correspondant trouvé pour le sujet:",
            selectedTopicId
          );
        }
      } else {
        console.log("Aucun PV disponible");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
      setError("Une erreur est survenue lors du chargement des détails");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour retourner à la liste des sujets
  const goBackToList = () => {
    navigate("/internships/manage-internships");
  };
  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Non disponible";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return dateString;
    }
  };
  // Fonction pour afficher le statut du PV
  const renderPVStatus = (isValidated) => {
    if (isValidated === true) {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Passed
        </Tag>
      );
    } else if (isValidated === false) {
      return (
        <Tag color="error" icon={<CloseCircleOutlined />}>
          Not Passed
        </Tag>
      );
    } else {
      return <Tag color="default">Pending</Tag>;
    }
  };
  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={goBackToList}
        style={{ marginBottom: "16px" }}
      >
        Back to Topics List
      </Button>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Card>
          <Empty description={error} />
        </Card>
      ) : topicDetails ? (
        <>
          <Title level={2} style={{ marginBottom: "24px" }}>
            {topicDetails.titre}
          </Title>

          {/* 3. Carte des informations de l'enseignant */}
          <Divider orientation="left">Teacher Informations </Divider>
          <Card
            title={
              <Space>
                <UserOutlined /> Encadrant
              </Space>
            }
            style={{ marginBottom: "24px", borderRadius: "8px" }}
          >
            {planDetails && planDetails.teachers ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Space>
                    <UserOutlined />
                    <Text strong>Name:</Text>
                  </Space>
                  <Text>{`${planDetails.teachers.firstName || ""} ${planDetails.teachers.lastName || ""}`}</Text>
                </div>

                {planDetails.teachers.email && (
                  <div>
                    <Space>
                      <MailOutlined />
                      <Text strong>Email:</Text>
                    </Space>
                    <Text>{planDetails.teachers.email}</Text>
                  </div>
                )}
              </Space>
            ) : (
              <Tag color="orange">Topic not yet assigned to a teacher</Tag>
            )}
          </Card>

          {/* 4. Carte des documents */}
          <Divider orientation="left">Documents</Divider>
          <Card
            title={
              <Space>
                <FileOutlined /> Submitted Documents
              </Space>
            }
            style={{ marginBottom: "24px", borderRadius: "8px" }}
          >
            {topicDetails.documents && topicDetails.documents.length > 0 ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                {topicDetails.documents.map((doc, index) => (
                  <div key={index || doc._id}>
                    <FileTextOutlined style={{ marginRight: "8px" }} />
                    <Text strong>Document : </Text>

                    <a
                      href={`http://localhost:5000/uploads/${doc.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {doc.title || `Document ${index + 1}`}
                    </a>
                  </div>
                ))}
              </Space>
            ) : (
              <Empty description="Aucun document soumis" />
            )}
          </Card>

          {/* 5. Carte des détails du rendez-vous */}
          <Divider orientation="left">Meeting details</Divider>
          <Card
            title={
              <Space>
                <CalendarOutlined /> Thesis Defense Appointment
              </Space>
            }
            style={{ marginBottom: "24px", borderRadius: "8px" }}
          >
            {planDetails && planDetails.date && planDetails.horaire ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Space>
                    <CalendarOutlined />
                    <Text strong>Date:</Text>
                  </Space>
                  <Text>{formatDate(planDetails.date)}</Text>
                </div>

                <div>
                  <Space>
                    <ClockCircleOutlined />
                    <Text strong>Hour:</Text>
                  </Space>
                  <Text>{planDetails.horaire}</Text>
                </div>

                {planDetails.googleMeetLink && (
                  <div>
                    <Space>
                      <VideoCameraOutlined />
                      <Text strong> Google Meet Link: </Text>
                    </Space>
                    <a
                      href={planDetails.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {planDetails.googleMeetLink}
                    </a>
                  </div>
                )}
              </Space>
            ) : (
              <Empty description="L'enseignant n'a pas encore planifié de rendez-vous" />
            )}
          </Card>

          {/* 6. Carte du rapport d'évaluation (PV) */}
          <Divider orientation="left">Evaluation Report </Divider>
          <Card
            title={
              <Space>
                <FileTextOutlined /> PV  
              </Space>
            }
            style={{ marginBottom: "24px", borderRadius: "8px" }}
          >
            {pvDetails ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Space>
                    <Text strong>Statut:</Text>
                    {renderPVStatus(pvDetails.isValidated)}
                  </Space>
                </div>

                {/* Afficher la raison uniquement si le PV n'est pas validé */}
                {pvDetails.isValidated === false && (
                  <div>
                    <Space>
                      <Text strong>Comment:</Text>
                    </Space>
                    <Text>{pvDetails.reason || "Aucun commentaire"}</Text>
                  </div>
                )}
              </Space>
            ) : (
              <Empty description="Aucun PV de soutenance disponible pour le moment" />
            )}
          </Card>
        </>
      ) : (
        <Card>
          <Empty description="Aucun détail de sujet trouvé" />
        </Card>
      )}
    </div>
  );
};

export default TopicStatus;
