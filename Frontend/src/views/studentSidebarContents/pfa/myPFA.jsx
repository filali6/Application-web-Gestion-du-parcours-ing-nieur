import React, { useEffect, useState } from "react";
import { getPfaByTeacher } from "services/pfaStudentService";
import {
  Card,
  Collapse,
  Button,
  Tag,
  List,
  Avatar,
  Typography,
  Space,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const { Panel } = Collapse;
const { Title, Text } = Typography;

const MyPFA = () => {
  const [groupedSubjects, setGroupedSubjects] = useState([]);
  const [activeKey, setActiveKey] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPfas();
  }, []);

  const fetchPfas = async () => {
    try {
      const data = await getPfaByTeacher();
      setGroupedSubjects(data);
      // Ouvrir le premier panel par défaut
      if (data.length > 0) setActiveKey([data[0]._id]);
    } catch (error) {
      Swal.fire("Erreur", "Impossible de récupérer les sujets", "error");
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "published":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Publié
          </Tag>
        );
      case "pending":
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            En attente
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getModeTag = (mode) => {
    return mode === "monome" ? (
      <Tag icon={<UserOutlined />} color="blue">
        Monôme
      </Tag>
    ) : (
      <Tag icon={<TeamOutlined />} color="purple">
        Binôme
      </Tag>
    );
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2} style={{ marginBottom: "24px" }}>
        <SolutionOutlined /> Liste des sujets par enseignant
      </Title>

      <Collapse
        accordion
        activeKey={activeKey}
        onChange={(keys) => setActiveKey(keys)}
        style={{ background: "#fff", borderRadius: "8px" }}
      >
        {groupedSubjects.map((teacher) => (
          <Panel
            header={
              <Space>
                <Text strong>
                  <TeamOutlined />
                  {teacher.firstName} {teacher.lastName}
                </Text>
                <Tag>{teacher.nbSujets} sujets</Tag>
              </Space>
            }
            key={teacher._id}
          >
            <List
              itemLayout="vertical"
              dataSource={teacher.sujets}
              renderItem={(sujet, index) => (
                <List.Item key={index}>
                  <Card
                    title={
                      <Space>
                        <Text strong>{sujet.title}</Text>
                        {getStatusTag(sujet.status)}
                        {getModeTag(sujet.mode)}
                      </Space>
                    }
                    style={{ marginBottom: "16px", borderRadius: "8px" }}
                    actions={[
                      <Button
                        type="primary"
                        onClick={() => navigate(`/pfa/choose/${sujet._id}`)}
                      >
                        Choisir ce sujet
                      </Button>,
                    ]}
                  >
                    <Text>{sujet.description}</Text>

                    <div style={{ marginTop: "16px" }}>
                      <Title level={5} style={{ marginBottom: "8px" }}>
                        <TeamOutlined /> Étudiants assignés
                      </Title>
                      {sujet.students && sujet.students.length > 0 ? (
                        <List
                          size="small"
                          dataSource={sujet.students}
                          renderItem={(student) => (
                            <List.Item>
                              <Space>
                                <Avatar size="small" icon={<UserOutlined />} />
                                <Text>
                                  {student.firstName} {student.lastName}
                                </Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text type="secondary">Aucun étudiant assigné</Text>
                      )}
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      <Title level={5} style={{ marginBottom: "8px" }}>
                        <SolutionOutlined /> Choix des étudiants
                      </Title>
                      {sujet.choices && sujet.choices.length > 0 ? (
                        <List
                          size="small"
                          dataSource={sujet.choices}
                          renderItem={(choice) => (
                            <List.Item>
                              <Space direction="vertical" size={0}>
                                <Space>
                                  <Avatar
                                    size="small"
                                    icon={<UserOutlined />}
                                  />
                                  <Text strong>
                                    {choice.student?.firstName}{" "}
                                    {choice.student?.lastName}
                                  </Text>
                                </Space>
                                <Space>
                                  <Tag>Priorité: {choice.priority}</Tag>
                                  <Tag
                                    color={
                                      choice.acceptedByTeacher
                                        ? "green"
                                        : "orange"
                                    }
                                  >
                                    {choice.acceptedByTeacher
                                      ? "Accepté"
                                      : "En attente"}
                                  </Tag>
                                </Space>
                              </Space>
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text type="secondary">Aucun choix enregistré</Text>
                      )}
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default MyPFA;
