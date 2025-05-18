import React, { useState } from "react";
import { addTopic } from "services/internshipservicesstudent";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Input, Upload, message } from "antd";
import {
  InboxOutlined,
  FileAddOutlined,
  SendOutlined,
} from "@ant-design/icons";

const ProjectForm = ({ onTopicAdded, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("titre", values.titre);

      // Assurez-vous que documents est bien fourni
      if (!values.documents || values.documents.length === 0) {
        message.error("Please upload at least one document.");
        setLoading(false);
        return;
      }

      values.documents.forEach((file) => {
        formData.append("documents", file.originFileObj);
      });

      const result = await addTopic(formData);

      message.success("Topic submitted successfully!");

      if (onTopicAdded) onTopicAdded(result);
      navigate("/myinternships");
      if (onClose) onClose();
    } catch (error) {
      message.error("You have already submitted two topics.");
      console.error("Erreur soumission sujet:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <FileAddOutlined style={{ marginRight: "8px" }} />
          Submit a Topic
        </div>
      }
      open={true}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ titre: "" }}
      >
        {/* Title Input */}
        <Form.Item
          name="titre"
          label="Topic Title"
          rules={[
            {
              required: true,
              message: "Please enter a title for your topic",
            },
          ]}
        >
          <Input placeholder="Enter topic title" />
        </Form.Item>

        {/* Upload Files */}
        <Form.Item
          name="documents"
          label="Documents"
          rules={[
            {
              required: true,
              message: "Please upload at least one document",
            },
          ]}
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
        >
          <Upload.Dragger
            beforeUpload={() => false}
            multiple
            listType="picture"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag and drop files into this area to upload them
            </p>
            <p className="ant-upload-hint">
              You can upload multiple files at once
            </p>
          </Upload.Dragger>
        </Form.Item>

        {/* Submit Button */}
        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: "10px" }}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={loading}
          >
            Submit Project
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectForm;
