import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Space,
  Spin,
  Checkbox,
  message,
  Divider,
  List,
  Tag,
  Avatar,
} from "antd";
import {
  TeamOutlined,
  CalendarOutlined,
  EditOutlined,
  MailOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  assignTeachersToTopics,
  fetchTeachers,
  getPlans,
  togglePlanVisibility,
  updateTeacherForPlan,
} from "./serviceInternshipsAdmin";
import UpdatePlanModal from "./updatePlan";
import SendMailModal from "./sendMail";

const TeacherTable = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [showPlans, setShowPlans] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEmailPlan, setSelectedEmailPlan] = useState(null);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const data = await fetchTeachers();
        setTeachers(data);
      } catch (err) {
        setError("Erreur lors du chargement des enseignants.");
        message.error("Erreur lors du chargement des enseignants.");
      } finally {
        setLoading(false);
      }
    };

    loadTeachers();
  }, []);

  const handleShowPlanning = async () => {
    setLoadingPlans(true);
    try {
      const result = await getPlans();
      // Filtrer les plannings qui ont des sujets valides
      const validPlans = result.plans.filter(
        (plan) => plan.sujet && (plan.sujet._id || plan.sujet.titre)
      );
      setPlans(validPlans);
      setShowPlans(true);
    } catch (err) {
      setError("Erreur lors de la récupération des plannings.");
      message.error("Erreur lors de la récupération des plannings.");
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleToggleAllVisibility = async () => {
    try {
      const shouldPublish = !plans.every((plan) => plan.isPublished);
      await togglePlanVisibility(shouldPublish);

      setPlans((prevPlans) =>
        prevPlans.map((plan) => ({ ...plan, isPublished: shouldPublish }))
      );

      message.success(
        shouldPublish
          ? "Tous les plannings ont été publiés avec succès."
          : "Tous les plannings ont été masqués avec succès."
      );
    } catch (err) {
      setError("Erreur lors de la modification globale des visibilités.");
      message.error("Erreur lors de la modification globale des visibilités.");
    }
  };

  const handleCheckboxChange = (teacherId) => {
    setSelectedTeachers((prevSelected) =>
      prevSelected.includes(teacherId)
        ? prevSelected.filter((id) => id !== teacherId)
        : [...prevSelected, teacherId]
    );
  };

  const handleAssignTeachers = async () => {
    try {
      await assignTeachersToTopics(selectedTeachers);
      setSelectedTeachers([]);
      message.success("Enseignants affectés avec succès !");
    } catch (err) {
      setError("Erreur lors de l'affectation des enseignants.");
      message.error("Erreur lors de l'affectation des enseignants.");
    }
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleOpenUpdateModal = (plan) => {
    setSelectedPlan(plan);
    setShowPopup(true); // Ouvre le modal
  };

  const handleOpenEmailModal = (plan) => {
    setSelectedEmailPlan(plan);
    setShowEmailModal(true);
  };

  const toggleEmailPopup = () => {
    setShowEmailModal(!showEmailModal);
  };

  const fetchAndUpdatePlans = async () => {
    try {
      const data = await getPlans();
      setPlans(data.plans); // Mise à jour de l'état avec les nouveaux plans
    } catch (error) {
      console.error("Erreur lors de la récupération des plannings:", error);
      message.error("Erreur lors de la récupération des plannings.");
    }
  };

  const handleUpdateTeacher = async (planId, newTeacherId, internshipId) => {
    try {
      await updateTeacherForPlan(planId, newTeacherId, internshipId);
      await fetchAndUpdatePlans(); // 🔄 Met à jour la liste après modif
      setShowPopup(false);
      message.success("Enseignant mis à jour avec succès !");
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'enseignant.", err);
      setError("Erreur lors de la mise à jour de l'enseignant.");
      message.error("Erreur lors de la mise à jour de l'enseignant.");
    }
  };

  // Configuration des colonnes pour la table Ant Design
  const columns = [
    {
      title: "Prénom",
      dataIndex: "firstName",
      key: "firstName",
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: "Nom",
      dataIndex: "lastName",
      key: "lastName",
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      filters: [...new Set(teachers.map((teacher) => teacher.grade))].map(
        (grade) => ({ text: grade, value: grade })
      ),
      onFilter: (value, record) => record.grade === value,
    },
    {
      title: "CIN",
      dataIndex: "cin",
      key: "cin",
      render: (text) => text || "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Checkbox
          checked={selectedTeachers.includes(record._id)}
          onChange={() => handleCheckboxChange(record._id)}
        >
          Assigner
        </Checkbox>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "24px", textAlign: "center" }}>
        <TeamOutlined /> Liste des enseignants
      </h2>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <div style={{ color: "red", textAlign: "center" }}>{error}</div>
      ) : teachers.length === 0 ? (
        <div style={{ textAlign: "center" }}>Aucun enseignant trouvé.</div>
      ) : !showPlans ? (
        <>
          <Table
            columns={columns}
            dataSource={teachers.map((teacher) => ({
              ...teacher,
              key: teacher._id,
            }))}
            pagination={{ pageSize: 10 }}
            bordered
            style={{
              marginBottom: "24px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              marginTop: "24px",
            }}
          >
            <Button
              type="primary"
              icon={<CalendarOutlined />}
              onClick={handleShowPlanning}
            >
              Afficher les plannings
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleAssignTeachers}
              disabled={selectedTeachers.length === 0}
               
            >
              Assigner les enseignants
            </Button>
          </div>
        </>
      ) : (
        <>
          <Divider>
            <h3 style={{ margin: 0 }}>
              <CalendarOutlined /> Liste des plannings
            </h3>
          </Divider>

          {loadingPlans ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
            </div>
          ) : plans.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              Aucun planning trouvé.
            </div>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={plans}
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)",
                marginBottom: "24px",
              }}
              pagination={{ pageSize: 5 }}
              renderItem={(plan) => {
                if (!plan.sujet || (!plan.sujet._id && !plan.sujet.titre)) {
                  return null; // Ne pas rendre cet élément
                }
                return (
                  <List.Item
                    key={plan._id}
                    actions={[
                      <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenUpdateModal(plan)}
                        style={{
                          backgroundColor: "#faad14",
                          borderColor: "#faad14",
                        }}
                      >
                        Modifier
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <FileTextOutlined
                          style={{
                            fontSize: "32px",
                            color: "#8B94A3",
                            margin: "8px",
                          }}
                        />
                      }
                      title={
                        <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                          {plan.sujet.titre || "Sujet Inconnu"}
                          <span style={{ marginLeft: "12px" }}>
                            {plan.isPublished ? (
                              <Tag color="green" icon={<EyeOutlined />}>
                                Publié
                              </Tag>
                            ) : (
                              <Tag
                                color="orange"
                                icon={<EyeInvisibleOutlined />}
                              >
                                Non publié
                              </Tag>
                            )}
                          </span>
                        </div>
                      }
                      description={
                        <Space
                          style={{ width: "100%" }}
                          direction="vertical"
                          size="small"
                        >
                          <div style={{ display: "flex", gap: "30px" }}>
                            <div>
                              <UserOutlined /> <b>Enseignant:</b>{" "}
                              {plan.teachers?.firstName}{" "}
                              {plan.teachers?.lastName}
                            </div>
                            <div>
                              <UserOutlined /> <b>Étudiant:</b>{" "}
                              {plan.sujet?.student?.firstName}{" "}
                              {plan.sujet?.student?.lastName}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "30px" }}>
                            {plan.date && (
                              <div>
                                <CalendarOutlined /> <b>Date:</b>{" "}
                                {new Date(plan.date).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </div>
                            )}
                            {plan.horaire && (
                              <div>
                                <ClockCircleOutlined /> <b>Heure:</b>{" "}
                                {plan.horaire}
                              </div>
                            )}
                          </div>
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}

          {plans.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Space size="middle">
                <Button
                  type={
                    plans.every((p) => p.isPublished) ? "danger" : "primary"
                  }
                  icon={
                    plans.every((p) => p.isPublished) ? (
                      <EyeInvisibleOutlined />
                    ) : (
                      <EyeOutlined />
                    )
                  }
                  onClick={handleToggleAllVisibility}
                  style={
                    plans.every((p) => p.isPublished)
                      ? { backgroundColor: "#f5222d", borderColor: "#f5222d" } // Rouge pour masquer
                      : { backgroundColor: "#13c2c2", borderColor: "#13c2c2" } // Turquoise pour publier
                  }
                >
                  {plans.every((p) => p.isPublished)
                    ? "Masquer tout"
                    : "Publier tout"}
                </Button>
                <Button
                  type="primary"
                  icon={<MailOutlined />}
                  onClick={toggleEmailPopup}
                >
                  Envoyer le planning
                </Button>
                <Button
                  onClick={() => setShowPlans(false)}
                  icon={<TeamOutlined />}
                >
                  Retour aux enseignants
                </Button>
              </Space>
            </div>
          )}
        </>
      )}

      {/* Les modals sont conservés tels quels */}
      {showPopup && selectedPlan && (
        <UpdatePlanModal
          show={showPopup}
          toggleShow={togglePopup}
          onSubmit={handleUpdateTeacher}
          plan={selectedPlan}
        />
      )}
      {showEmailModal && (
        <SendMailModal show={showEmailModal} toggleShow={toggleEmailPopup} />
      )}
    </div>
  );
};

export default TeacherTable;
