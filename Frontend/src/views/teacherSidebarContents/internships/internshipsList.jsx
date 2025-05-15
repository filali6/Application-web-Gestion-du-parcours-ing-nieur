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
        getTeacherPVDetails(), // Remplace getFinalInternshipDetails()
      ]);

      // Afficher des exemples des données récupérées pour comprendre leur structure
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

      // Créons une table de correspondance pour les PVs basée sur l'ID du sujet
      const pvBySujetId = {};

      pvData.forEach((pv) => {
        if (pv.sujetId) {
          console.log(`Mapping PV for sujet ID: ${pv.sujetId}`, pv);
          pvBySujetId[pv.sujetId] = pv;
        }
      });

      console.log("PVs by sujet ID:", pvBySujetId);

      const topicsWithSchedule = topicsData.map((topic) => {
        console.log("Processing topic:", topic);

        const matchingPlan = plansData.find(
          (plan) =>
            plan.sujet?._id === topic._id ||
            plan.sujet?._id === topic.sujetId ||
            (plan.sujet && plan.sujet === topic._id) ||
            (plan.sujetId && plan.sujetId === topic.sujetId)
        );

        // Vérifier si l'email de l'étudiant est défini
        const studentEmail = topic.student?.email || topic.studentEmail;
        const studentName = topic.student?.lastName || topic.studentName;

        console.log(
          `Looking for PV with student name: ${studentName} and sujet ID: ${topic._id || topic.sujetId}`
        );

        // Rechercher le PV correspondant en utilisant l'ID du sujet
        const topicId = topic._id || topic.sujetId;
        const matchingPV = pvBySujetId[topicId] || null;

        if (matchingPV) {
          console.log(
            `Found matching PV for topic (${topic.sujetTitre}):`,
            matchingPV
          );
        } else {
          console.log(`No matching PV found for topic: ${topic.sujetTitre}`);
        }

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

        // Récupérer les détails du PV
        let pvDetails = null;

        if (matchingPV) {
          console.log(
            `Final PV data found for topic ${topic.sujetTitre}:`,
            matchingPV
          );

          pvDetails = {
            isValidated:
              matchingPV.isValidated !== undefined
                ? matchingPV.isValidated
                : null,
            reason: matchingPV.reason || "Non applicable",
          };
        } else {
          console.log(`No PV data found for topic ${topic.sujetTitre}`);
        }

        return {
          ...topic,
          ...planningData,
          // Stocker les détails du PV directement dans la propriété pv
          pv: pvDetails,
        };
      });

      console.log("All topics with planning and PV:", topicsWithSchedule);
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
            <Tag>Aucun document</Tag>
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
          return <Tag color="default">Non disponible</Tag>;
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
            Planifier
          </Button>
          <Button onClick={() => handleOpenPvModal(record)}>Remplir PV</Button>
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
              <Radio value={true}>Validé</Radio>
              <Radio value={false}>Non validé</Radio>
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
