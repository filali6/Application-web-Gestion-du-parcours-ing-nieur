import React, { useState, useEffect } from "react";
import { Table, Button, Space, Tag, Modal, Form, Input, Spin } from "antd";
import {
  EditOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  FileTextOutlined,
  UserOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { fetchTeacherTopics, getPlansDetails, updateSoutenance } from "./internshipsListservice";

const { TextArea } = Input;

const InternshipsList = () => {
  // États pour gérer le modal
  const [showModal, setShowModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [allTopics, setAllTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // États pour les champs du formulaire
  const [horaire, setHoraire] = useState("");
  const [date, setDate] = useState("");
  const [googleMeetLink, setGoogleMeetLink] = useState("");

  // Fonction pour formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Charger les sujets initialement
  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);

      const [topicsData, plansData] = await Promise.all([
        fetchTeacherTopics(),
        getPlansDetails(),
      ]);

      console.log("Topics récupérés :", topicsData);
      console.log("Plans récupérés :", plansData);

      // Fusionner chaque topic avec son plan associé s'il existe
      const topicsWithSchedule = topicsData.map((topic) => {
        // On suppose que topic._id ou topic.sujetId correspond au sujet du plan
        const matchingPlan = plansData.find(
          (plan) =>
            plan.sujet?._id === topic._id || plan.sujet?._id === topic.sujetId
        );

        const planningData = matchingPlan
          ? {
              date: matchingPlan.date || "",
              horaire: matchingPlan.horaire || "",
              googleMeetLink: matchingPlan.googleMeetLink || "",
            }
          : {
              date: "",
              horaire: "",
              googleMeetLink: "",
            };

        console.log(
          `Planning pour le sujet ${topic._id || topic.sujetId}:`,
          planningData
        );

        return {
          ...topic,
          ...planningData,
        };
      });

      setAllTopics(topicsWithSchedule);
    } catch (err) {
      console.error("Erreur lors du chargement des sujets et plans:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ouvrir le modal
  const openModal = (topic) => {
    console.log("Ouverture du modal pour le sujet:", topic.sujetId);
    setSelectedTopic(topic);
    setHoraire(topic.horaire || "");
    setDate(topic.date || "");
    setGoogleMeetLink(topic.googleMeetLink || "");
    setShowModal(true);
  };

  // Fonction pour fermer le modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTopic(null);
  };

  // Fonction pour sauvegarder les modifications
  const handleSaveChanges = async () => {
    if (selectedTopic) {
      console.log("Sauvegarde des modifications pour:", selectedTopic);

      try {
        // Appel à la fonction de service updateSoutenance
        const result = await updateSoutenance(
          selectedTopic.sujetId,
          date,
          horaire,
          googleMeetLink
        );
        console.log("Données retournées après mise à jour:", result);
        
        // Mise à jour locale des sujets après succès de l'appel API
        const updatedTopics = allTopics.map((topic) => {
          if (topic.sujetId === selectedTopic.sujetId) {
            const updatedTopic = {
              ...topic,
              date: date,
              horaire: horaire,
              googleMeetLink: googleMeetLink,
            };
            console.log("Topic mis à jour:", updatedTopic);
            return updatedTopic;
          }
          return topic;
        });

        setAllTopics(updatedTopics);

        // Afficher un message de succès
        Modal.success({
          title: 'Succès',
          content: 'La soutenance a été planifiée avec succès!',
        });

        // Fermer le modal
        handleCloseModal();
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la soutenance:", error);
        
        // Afficher un message d'erreur
        Modal.error({
          title: 'Erreur',
          content: 'Erreur lors de la planification de la soutenance. Veuillez réessayer.',
        });
      }
    }
  };

  // Définition des colonnes pour la Table Ant Design
  const columns = [
    {
      title: "Titre",
      dataIndex: "sujetTitre",
      key: "sujetTitre",
      render: (text, record) => <strong>{text}</strong>,
    },
    {
      title: "Étudiant",
      dataIndex: "studentName",
      key: "studentName",
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <span>
            <UserOutlined /> {text || "Non précisé"}
          </span>
          {record.studentEmail && (
            <span>
              <MailOutlined /> {record.studentEmail}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: "Planification",
      key: "schedule",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.date && record.horaire ? (
            <>
              <span>
                <CalendarOutlined /> {formatDate(record.date)}
              </span>
              <span>
                <ClockCircleOutlined /> {record.horaire}
              </span>
              {record.googleMeetLink && (
                <a
                  href={record.googleMeetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkOutlined /> Lien Google Meet
                </a>
              )}
            </>
          ) : (
            <Tag color="orange">Non planifié</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Documents",
      key: "documents",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.documents && record.documents.length > 0 ? (
            record.documents.map((doc, i) => (
              <a
                key={i}
                href={`http://localhost:5000/uploads/${doc.filename}`}
                target="_blank"
                rel="noopener noreferrer"
                download={doc.title}
              >
                <FileTextOutlined /> {doc.title}
              </a>
            ))
          ) : (
            <Tag color="default">Aucun document</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "PV",
      key: "pv",
      render: (_, record) => (
        <Space>
          {record.pv ? (
            <Tag color="green">Disponible</Tag>
          ) : (
            <Tag color="default">Non disponible</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space direction="vertical">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            size="middle"
          >
            Planifier
          </Button>
          <Button
            type="default"
            onClick={() => handleFillPV(record)}
            size="middle"
          >
            Remplir PV
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "24px" }}>Assigned Subjects</h2>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <div style={{ marginTop: "20px" }}>Chargement des sujets...</div>
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={allTopics}
          rowKey="sujetId"
          pagination={{ pageSize: 10 }}
          bordered
          style={{ background: "#fff", borderRadius: "8px" }}
        />
      )}

      {/* Modal pour planifier un rendez-vous (version Ant Design) */}
      <Modal
        title={
          <div>
            Planifier un rendez-vous
            {selectedTopic && (
              <div style={{ fontSize: "14px", color: "#999" }}>
                Sujet: {selectedTopic.sujetTitre}
              </div>
            )}
          </div>
        }
        open={showModal}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            Annuler
          </Button>,
          <Button key="submit" type="primary" onClick={handleSaveChanges}>
            Enregistrer
          </Button>,
        ]}
        width={600}
      >
        {selectedTopic && (
          <Form layout="vertical">
            <Form.Item label="Date">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Heure">
              <Input
                type="time"
                value={horaire}
                onChange={(e) => setHoraire(e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Lien Google Meet">
              <Input
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={googleMeetLink}
                onChange={(e) => setGoogleMeetLink(e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Étudiant">
              <Input
                value={selectedTopic?.studentName || "Non précisé"}
                disabled
                prefix={<UserOutlined />}
              />
            </Form.Item>

            <Form.Item label="Email">
              <Input
                value={selectedTopic?.studentEmail || ""}
                disabled
                prefix={<MailOutlined />}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default InternshipsList;