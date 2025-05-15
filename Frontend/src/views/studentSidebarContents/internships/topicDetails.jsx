import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Typography, Space, Button, Empty, Divider ,Tag} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  UserOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { Spinner } from "react-bootstrap";
import { getStudentInternshipDetails, getStudentPVDetails } from "services/internshipservicesstudent";

const { Title, Text } = Typography;

const TopicDetailsPage = () => {
  const navigate = useNavigate();
  const [internshipDetails, setInternshipDetails] = useState(null);
    // Ajout de l'état pour les PV
  const [pvDetails, setPvDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInternshipDetails();
  }, []);

  const loadInternshipDetails = async () => {
    try {
      setLoading(true);
      const [internshipData, pvData] = await Promise.all([
        getStudentInternshipDetails(),
        getStudentPVDetails(),

      ]);
      setInternshipDetails(internshipData);
      console.log("PV data received:", pvData);
      // Si nous avons des données de PV, trouver celui qui correspond au sujet courant
      if (pvData && pvData.length > 0 && internshipData) {
        const matchingPV = pvData.find(
          (pv) => pv.sujetId === internshipData.sujetId
        );
        if (matchingPV) {
          console.log("Found matching PV:", matchingPV);
          setPvDetails(matchingPV);
        } else {
          console.log(
            "No matching PV found for sujet:",
            internshipData.sujetId
          );
        }
      }
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
  // Fonction pour afficher le statut du PV de manière plus visuelle
  const renderPVStatus = (isValidated) => {
    if (isValidated === true) {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Validé
        </Tag>
      );
    } else if (isValidated === false) {
      return (
        <Tag color="error" icon={<CloseCircleOutlined />}>
          Non validé
        </Tag>
      );
    } else {
      return <Tag color="default">En attente</Tag>;
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
        Back to my Internship
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

          <Divider orientation="left">Internship Details</Divider>

          <Card
            title={
              <Space>
                <UserOutlined /> Supervisor
              </Space>
            }
            style={{ marginBottom: "24px", borderRadius: "8px" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Space>
                  <UserOutlined />
                  <Text strong> Supervisor Name:</Text>
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

          <Divider orientation="left">Meeting details</Divider>

          <Card
            title={
              <Space>
                <CalendarOutlined /> Thesis Defense Appointment
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
                    <Text strong>Hour:</Text>
                  </Space>
                  <Text> {internshipDetails.horaire}</Text>
                </div>

                <div>
                  <Space>
                    <VideoCameraOutlined />
                    <Text strong> Google Meet Link :</Text>
                  </Space>
                  {internshipDetails.googleMeetLink !==
                  "Google Meet Link Not available" ? (
                    <a
                      href={internshipDetails.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {internshipDetails.googleMeetLink}
                    </a>
                  ) : (
                    <Text> Google Meet Link Not available</Text>
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

          <Divider orientation="left">Evaluation Repport </Divider>

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
