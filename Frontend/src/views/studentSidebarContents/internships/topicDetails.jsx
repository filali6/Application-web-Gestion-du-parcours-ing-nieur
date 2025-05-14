import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Typography, Space, Button, Empty, Divider } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  UserOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Spinner } from "react-bootstrap";
import { getStudentInternshipDetails } from "services/internshipservicesstudent";

const { Title, Text } = Typography;

const TopicDetailsPage = () => {
  const navigate = useNavigate();
  const [internshipDetails, setInternshipDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInternshipDetails();
  }, []);

  const loadInternshipDetails = async () => {
    try {
      setLoading(true);
      const data = await getStudentInternshipDetails();
      setInternshipDetails(data);
    } catch (error) {
      console.error("Erreur lors du chargement des détails du stage:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Jour non disponible")
      return "Jour non disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const hasAppointmentDetails = (details) => {
    return (
      details &&
      details.jour !== "Jour non disponible" &&
      details.horaire !== "Horaire non disponible" &&
      details.googleMeetLink !== "Lien Google Meet non disponible"
    );
  };
  // Fonction pour retourner à la liste des sujets
const goBackToList = () => {
  navigate("/internships/my-internships");
};

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={goBackToList}
        style={{ marginBottom: "16px" }}
      >
        Retour à Mes Stages
      </Button>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spinner animation="border" />
        </div>
      ) : internshipDetails ? (
        <>
          <Title level={2} style={{ marginBottom: "24px" }}>
            {internshipDetails.sujetTitre}
          </Title>

          <Divider orientation="left">Détails du Stage</Divider>

          <Card
            title={
              <Space>
                <UserOutlined /> Encadrant
              </Space>
            }
            style={{ marginBottom: "24px", borderRadius: "8px" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Space>
                  <UserOutlined />
                  <Text strong>Nom de l'encadrant:</Text>
                </Space>
                <Text> {internshipDetails.teacherName}</Text>
              </div>

              <div>
                <Space>
                  <MailOutlined />
                  <Text strong>Email:</Text>
                </Space>
                <Text> {internshipDetails.teacherEmail}</Text>
              </div>
            </Space>
          </Card>

          <Divider orientation="left">Détails du Rendez-vous</Divider>

          <Card
            title={
              <Space>
                <CalendarOutlined /> Rendez-vous de Soutenance
              </Space>
            }
            style={{ marginBottom: "24px", borderRadius: "8px" }}
          >
            {hasAppointmentDetails(internshipDetails) ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Space>
                    <CalendarOutlined />
                    <Text strong>Date:</Text>
                  </Space>
                  <Text> {formatDate(internshipDetails.jour)}</Text>
                </div>

                <div>
                  <Space>
                    <ClockCircleOutlined />
                    <Text strong>Heure:</Text>
                  </Space>
                  <Text> {internshipDetails.horaire}</Text>
                </div>

                <div>
                  <Space>
                    <VideoCameraOutlined />
                    <Text strong>Lien Google Meet:</Text>
                  </Space>
                  {internshipDetails.googleMeetLink !==
                  "Lien Google Meet non disponible" ? (
                    <a
                      href={internshipDetails.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {internshipDetails.googleMeetLink}
                    </a>
                  ) : (
                    <Text>Lien Google Meet non disponible</Text>
                  )}
                </div>
              </Space>
            ) : (
              <Empty
                description="Aucun rendez-vous planifié pour le moment"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>

          <Divider orientation="left">Rapport d'Évaluation</Divider>

          <Card
            title={
              <Space>
                <FileTextOutlined /> PV Soutenance
              </Space>
            }
            style={{ marginBottom: "24px", borderRadius: "8px" }}
          >
            {internshipDetails.pv ? (
              <div>
                <Text>{internshipDetails.pv}</Text>
              </div>
            ) : (
              <Empty
                description="Aucun PV de soutenance disponible pour le moment"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </>
      ) : (
        <Card>
          <Empty description="Aucun détail de stage trouvé" />
        </Card>
      )}
    </div>
  );
};

export default TopicDetailsPage;
