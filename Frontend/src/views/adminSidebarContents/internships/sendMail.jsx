import React, { useState } from "react";
import { Modal, Button, Radio, Form, message } from "antd";
import { SendOutlined, MailOutlined } from "@ant-design/icons";
import { sendPlanningEmails } from "./serviceInternshipsAdmin";

const SendMailModal = ({ show, toggleShow }) => {
  const [form] = Form.useForm();
  const [sendType, setSendType] = useState("first");

  const handleSubmit = async () => {
    try {
      const response = await sendPlanningEmails(sendType);
      if (response.success) {
        message.success("Emails envoyés avec succès !");
        toggleShow();
      } else {
        message.error(response.message || "Erreur lors de l'envoi des emails");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      message.error("Erreur lors de l'envoi des emails");
    }
  };

  return (
    <Modal
      title={
        <span>
          <MailOutlined style={{ marginRight: 8 }} /> Choose send type
        </span>
      }
      open={show}
      onCancel={toggleShow}
      footer={[
        <Button key="cancel" onClick={toggleShow}>
          Cancel
        </Button>,
        <Button
          key="send"
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSubmit}
        >
          Send
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ sendType: "first" }}>
        <Form.Item name="sendType" style={{ marginBottom: 0 }}>
          <Radio.Group
            value={sendType}
            onChange={(e) => setSendType(e.target.value)}
            style={{ width: "100%" }}
          >
            <Radio.Button
              value="first"
              style={{
                width: "50%",
                textAlign: "center",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              First send
            </Radio.Button>
            <Radio.Button
              value="modified"
              style={{
                width: "50%",
                textAlign: "center",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Send After Update 
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SendMailModal;
