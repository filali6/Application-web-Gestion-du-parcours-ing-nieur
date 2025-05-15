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
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("titre", values.titre);

      // Add files to FormData
      fileList.forEach((file) => {
        formData.append("documents", file.originFileObj);
      });

      const result = await addTopic(formData);

      // Use Ant Design success message instead of alert
      message.success("Topic submitted successfully!");

      console.log(result);
      if (onTopicAdded) onTopicAdded(result);
      navigate("/myinternships");
      if (onClose) onClose();
    } catch (error) {
      // Use Ant Design error message instead of alert
      message.error("You have already submitted two topics.");
      console.error("Error submitting the topic:", error);
    } finally {
      setLoading(false);
    }
  };

  // Configuration for Upload component
  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false; // Prevent automatic upload
    },
    fileList,
    multiple: true,
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
          getValueFromEvent={(e) => {
            if (Array.isArray(e)) {
              return e;
            }
            return e && e.fileList;
          }}
        >
          <Upload.Dragger {...uploadProps} listType="picture">
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
