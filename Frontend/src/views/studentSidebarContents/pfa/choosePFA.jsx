import React, { useEffect, useState } from "react";
import { getPfaByTeacher, selectPfa } from "services/pfaStudentService";
import {
  Card,
  InputNumber,
  Button,
  Input,
  Select,
  Typography,
  Space,
  Avatar,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  UserOutlined,
  TeamOutlined,
  StarOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";

const { Option } = Select;
const { Title, Text } = Typography;

const ChoosePFA = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pfas, setPfas] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPfas();
  }, [id]);

  const loadPfas = async () => {
    try {
      setLoading(true);
      const data = await getPfaByTeacher();

      const allSubjects = data.flatMap((teacher) =>
        teacher.sujets.map((s) => ({
          ...s,
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          teacherAvatar: `${teacher.firstName[0]}${teacher.lastName[0]}`,
        }))
      );

      if (id) {
        const selectedPfa = allSubjects.find((pfa) => pfa._id === id);
        setPfas(selectedPfa ? [selectedPfa] : []);
      } else {
        setPfas(allSubjects);
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Error loading topics",
        icon: "error",
        confirmButtonColor: "#1890ff",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (pfaId, field, value) => {
    setSelected((prev) => ({
      ...prev,
      [pfaId]: {
        ...prev[pfaId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (pfaId) => {
    const values = selected[pfaId];
    if (!values?.priority) {
      return Swal.fire({
        title: "Attention",
        text: "Please set a priority",
        icon: "warning",
        confirmButtonColor: "#1890ff",
      });
    }

    try {
      await selectPfa(pfaId, {
        priority: values.priority,
        binomeId: values.binomeId || undefined,
        acceptedByTeacher: values.acceptedByTeacher || false,
      });

      await Swal.fire({
        title: "Success",
        text: "Topic successfully selected",
        icon: "success",
        confirmButtonColor: "#1890ff",
      });

      navigate("/pfa/my-pfa");
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.error || "Error while selecting",
        icon: "error",
        confirmButtonColor: "#1890ff",
      });
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "800px",
        margin: "0 auto",
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/pfa/my-pfa")}
        style={{ marginBottom: "24px" }}
      >
        Back to list
      </Button>

      <Title level={2} style={{ marginBottom: "24px" }}>
        <StarOutlined /> Select a topic
      </Title>

      {pfas.length === 0 ? (
        <Card loading={loading}>
          <Text type="secondary">
            {loading ? "Loading..." : "No topics found"}
          </Text>
        </Card>
      ) : (
        pfas.map((pfa) => (
          <Card
            key={pfa._id}
            style={{
              marginBottom: "24px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            loading={loading}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Title level={4}>{pfa.title}</Title>
                <Space>
                  <Avatar size="small">{pfa.teacherAvatar}</Avatar>
                  <Text type="secondary">{pfa.teacherName}</Text>
                </Space>
              </div>

              <Text>{pfa.description}</Text>

              <Divider orientation="left" plain>
                {pfa.mode === "monome" ? (
                  <Space>
                    <UserOutlined /> Mode monôme
                  </Space>
                ) : (
                  <Space>
                    <TeamOutlined /> Mode binôme
                  </Space>
                )}
              </Divider>

              <Space direction="vertical" style={{ width: "100%" }}>
                <Space>
                  <Text strong>Priority:</Text>
                  <InputNumber
                    min={1}
                    max={3}
                    style={{ width: "80px" }}
                    prefix={<StarOutlined />}
                    onChange={(val) => handleSelect(pfa._id, "priority", val)}
                  />
                </Space>

                {pfa.mode === "binome" && (
                  <Space>
                    <Text strong>binôme ID:</Text>
                    <Input
                      placeholder="Enter Student ID"
                      style={{ width: "200px" }}
                      onChange={(e) =>
                        handleSelect(pfa._id, "binomeId", e.target.value)
                      }
                    />
                  </Space>
                )}

                <Space>
                  <Text strong>Accepted by the teacher:</Text>
                  <Select
                    style={{ width: "120px" }}
                    onChange={(val) =>
                      handleSelect(pfa._id, "acceptedByTeacher", val)
                    }
                    defaultValue={false}
                  >
                    <Option value={true}>
                      <CheckOutlined /> Yes
                    </Option>
                    <Option value={false}>No</Option>
                  </Select>
                </Space>
              </Space>

              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleSubmit(pfa._id)}
                style={{ marginTop: "16px" }}
              >
                Validate the selection
              </Button>
            </Space>
          </Card>
        ))
      )}
    </div>
  );
};

export default ChoosePFA;
