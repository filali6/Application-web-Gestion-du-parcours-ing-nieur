import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Spin,
  Radio,
} from "antd";
import {
  EditOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  FileTextOutlined,
  UserOutlined,
  MailOutlined,
} from "@ant-design/icons";
import {
  fetchTeacherTopics,
  getPlansDetails,
  updateSoutenance,
  fillPV,
  getTeacherPVDetails,
} from "./internshipsListservice"; // Assurez-vous que fillPV existe dans ce fichier

const { TextArea } = Input;

const InternshipsList = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [allTopics, setAllTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [horaire, setHoraire] = useState("");
  const [date, setDate] = useState("");
  const [googleMeetLink, setGoogleMeetLink] = useState("");

  const [selectedSujet, setSelectedSujet] = useState(null);
  const [isPvModalVisible, setIsPvModalVisible] = useState(false);
  const [pvContent, setPvContent] = useState("");
  const [isValidated, setIsValidated] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const [topicsData, plansData, pvData] = await Promise.all([
        fetchTeacherTopics(),
        getPlansDetails(),
        getTeacherPVDetails(),
      ]);

      // Afficher les données pour le débogage
      console.log("STRUCTURE ANALYSIS:");
      console.log(
        "Fetched Topics Data (first item):",
        topicsData.length > 0 ? topicsData[0] : "No topics"
      );
      console.log(
        "Fetched Plans Data (first item):",
        plansData.length > 0 ? plansData[0] : "No plans"
      );
      console.log("Fetched PV Data (all):", pvData);

      // Préparation des PVs
      const pvBySujetId = {};
      pvData.forEach((pv) => {
        if (pv.sujetId) {
          pvBySujetId[pv.sujetId] = pv;
        }
      });

      // Traitement des sujets
      const topicsWithSchedule = [];

      for (const topic of topicsData) {
        // Vérifions si le sujet est valide avant de le traiter
        // Un sujet est considéré comme supprimé si:
        // 1. Il n'a pas de titre
        // 2. Son titre est "Non disponible" ou contient des termes indiquant une suppression
        if (
          !topic.sujetTitre ||
          topic.sujetTitre.toLowerCase().includes("non disponible") ||
          topic.sujetTitre.toLowerCase().includes("supprimé") ||
          topic.sujetTitre.toLowerCase().includes("deleted")
        ) {
          console.log(`Topic skipped (appears to be deleted):`, topic);
          continue; // Passer au sujet suivant
        }

        console.log("Processing valid topic:", topic);

        const matchingPlan = plansData.find(
          (plan) =>
            plan.sujet?._id === topic._id ||
            plan.sujet?._id === topic.sujetId ||
            (plan.sujet && plan.sujet === topic._id) ||
            (plan.sujetId && plan.sujetId === topic.sujetId)
        );

        const topicId = topic._id || topic.sujetId;
        const matchingPV = pvBySujetId[topicId] || null;

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

        let pvDetails = null;
        if (matchingPV) {
          pvDetails = {
            isValidated:
              matchingPV.isValidated !== undefined
                ? matchingPV.isValidated
                : null,
            reason: matchingPV.reason || "Non applicable",
          };
        }

        // Ajouter le sujet valide à notre tableau
        topicsWithSchedule.push({
          ...topic,
          ...planningData,
          pv: pvDetails,
        });
      }

      console.log(
        "Final list of valid topics with planning and PV:",
        topicsWithSchedule
      );
      setAllTopics(topicsWithSchedule);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };
  const openModal = (topic) => {
    setSelectedTopic(topic);
    setHoraire(topic.horaire || "");
    setDate(topic.date || "");
    setGoogleMeetLink(topic.googleMeetLink || "");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTopic(null);
  };

  const handleOpenPvModal = (record) => {
    setSelectedSujet(record);
    setIsPvModalVisible(true);
    setIsValidated(true);
    setPvContent("");
  };

  const handleSubmitPv = async () => {
    try {
      // Formater les données selon la structure attendue par le backend
      const data = {
        isValidated,
        reason: pvContent.trim(),
      };

      console.log("Submitting PV for:", selectedSujet.sujetId);
      console.log("PV data:", data);

      const response = await fillPV(selectedSujet.sujetId, data);
      console.log("PV submission response:", response);

      Modal.success({
        title: "Succès",
        content: response.message || "Le PV a été rempli avec succès.",
      });

      // Recharger les données après la soumission
      await loadTopics();

      setIsPvModalVisible(false);
      setSelectedSujet(null);
      setPvContent("");
    } catch (error) {
      console.error("Error submitting PV:", error);
      Modal.error({
        title: "Erreur",
        content: error.message || "Erreur lors du remplissage du PV.",
      });
    }
  };

  const handleSaveChanges = async () => {
    if (selectedTopic) {
      try {
        await updateSoutenance(
          selectedTopic.sujetId,
          date,
          horaire,
          googleMeetLink
        );

        // Recharger les données au lieu de faire une mise à jour manuelle
        await loadTopics();

        Modal.success({
          title: "Succès",
          content: "La soutenance a été planifiée avec succès!",
        });

        handleCloseModal();
      } catch (error) {
        Modal.error({
          title: "Erreur",
          content: "Erreur lors de la planification de la soutenance.",
        });
      }
    }
  };

  const columns = [
    {
      title: "Titre",
      dataIndex: "sujetTitre",
      key: "sujetTitre",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Étudiant",
      dataIndex: "studentName",
      key: "studentName",
      render: (text, record) => (
        <Space direction="vertical">
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
        <Space direction="vertical">
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
                  rel="noreferrer"
                >
                  <LinkOutlined /> Google Meet Link
                </a>
              )}
            </>
          ) : (
            <Tag color="orange">Not scheduled</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Documents",
      key: "documents",
      render: (_, record) => (
        <Space direction="vertical">
          {record.documents && record.documents.length > 0 ? (
            record.documents.map((doc, i) => (
              <a
                key={i}
                href={`http://localhost:5000/uploads/${doc.filename}`}
                target="_blank"
                rel="noreferrer"
              >
                <FileTextOutlined /> {doc.title}
              </a>
            ))
          ) : (
            <Tag>No document</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "PV",
      key: "pv",
      render: (_, record) => {
        // Utiliser directement la propriété pv
        const pv = record.pv;

        // Log pour débogage
        console.log(`Rendering PV for ${record.sujetTitre}:`, pv);

        if (!pv) {
          return <Tag color="default">Not available</Tag>;
        }

        // Si pv est une chaîne de caractères
        if (typeof pv === "string") {
          return <Tag color="default">{pv}</Tag>;
        }

        // Déterminer l'état de validation et la raison à partir de l'objet pv
        let isValidatedValue = pv.isValidated;
        let reasonValue = pv.reason || "";

        // Traiter spécifiquement les valeurs "Validé" et "Non validé"
        let validationStatus;
        let tagColor;

        if (isValidatedValue === true || isValidatedValue === "Validé") {
          validationStatus = "Validé";
          tagColor = "green";
        } else if (
          isValidatedValue === false ||
          isValidatedValue === "Non validé"
        ) {
          validationStatus = "Non validé";
          tagColor = "red";
        } else if (isValidatedValue === undefined) {
          validationStatus = "Non spécifié";
          tagColor = "default";
        } else {
          // Valeur inconnue, l'afficher telle quelle
          validationStatus = isValidatedValue?.toString() || "État inconnu";
          tagColor = "blue";
        }

        return (
          <div>
            <Tag color={tagColor}>{validationStatus}</Tag>
            {reasonValue && (
              <div
                style={{ fontSize: "12px", color: "#555", marginTop: "5px" }}
              >
                {reasonValue}
              </div>
            )}
          </div>
        );
      },
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
          >
            Schedule
          </Button>
          <Button onClick={() => handleOpenPvModal(record)}>Fill out PV</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>Assigned Subjects</h2>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          columns={columns}
          dataSource={allTopics}
          rowKey="sujetId"
          pagination={{ pageSize: 10 }}
          bordered
        />
      )}

      <Modal
        title={`Planifier un rendez-vous - ${selectedTopic?.sujetTitre || ""}`}
        open={showModal}
        onCancel={handleCloseModal}
        onOk={handleSaveChanges}
        okText="Enregistrer"
        cancelText="Annuler"
      >
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
              value={googleMeetLink}
              onChange={(e) => setGoogleMeetLink(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Remplir PV - ${selectedSujet?.sujetTitre || ""}`}
        open={isPvModalVisible}
        onCancel={() => setIsPvModalVisible(false)}
        onOk={handleSubmitPv}
        okText="Soumettre"
        cancelText="Annuler"
      >
        <Form layout="vertical">
          <Form.Item label="Validation">
            <Radio.Group
              value={isValidated}
              onChange={(e) => setIsValidated(e.target.value)}
            >
              <Radio value={true}>Passed</Radio>
              <Radio value={false}>Not Passed</Radio>
            </Radio.Group>
          </Form.Item>

          {!isValidated && (
            <Form.Item label="Raison">
              <TextArea
                rows={4}
                value={pvContent}
                onChange={(e) => setPvContent(e.target.value)}
                placeholder="Indiquez la raison"
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default InternshipsList;
