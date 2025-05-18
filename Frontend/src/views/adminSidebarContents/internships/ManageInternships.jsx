import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Space, List, Button, Divider } from "antd";
import {
  BookOutlined,
  UserSwitchOutlined,
  ArrowLeftOutlined,
  FileSearchOutlined,
  RightOutlined,
} from "@ant-design/icons";

// Import des composants réels
import Consult from "./Consult";
import Affect from "./Affect";

const { Title, Text } = Typography;

const ManageInternships = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();

  // Options pour la gestion des stages
  const options = [
    {
      key: "consult",
      title: "View the list of subjects and students",
      description: "See all the proposed subjects and the associated students.",
      icon: <FileSearchOutlined />,
    },
    {
      key: "affect",
      title: "Assign teachers to subjects",
      description: "Assign a teacher to each proposed subject.",
      icon: <UserSwitchOutlined />,
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {!selectedOption ? (
        <>
          <Title level={2} style={{ marginBottom: "24px" }}>
            <BookOutlined /> Manage Internships
          </Title>

          <Text style={{ marginBottom: "24px", display: "block" }}>
            Choose an option to continue:
          </Text>

          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
            dataSource={options}
            renderItem={(option) => (
              <List.Item>
                <Card
                  title={
                    <Space>
                      {option.icon}
                      <Text strong>{option.title}</Text>
                    </Space>
                  }
                  hoverable
                  onClick={() => setSelectedOption(option.key)}
                  style={{
                    marginBottom: "16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    height: "100%",
                  }}
                  actions={[
                    <div key="select">
                      <RightOutlined /> Select Option
                    </div>,
                  ]}
                >
                  <Text>{option.description}</Text>
                </Card>
              </List.Item>
            )}
          />
        </>
      ) : (
        <>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => setSelectedOption(null)}
            style={{ marginBottom: "16px" }}
          >
            Back to Options
          </Button>

          <Divider />

          <div style={{ marginTop: "24px" }}>
            {selectedOption === "consult" && <Consult />}
            {selectedOption === "affect" && <Affect />}
          </div>
        </>
      )}
    </div>
  );
};

export default ManageInternships;
