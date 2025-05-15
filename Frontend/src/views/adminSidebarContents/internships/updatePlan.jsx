import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Select, message } from "antd";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
import { fetchTeachers } from "./serviceInternshipsAdmin";

const { Option } = Select;

const UpdatePlanModal = ({ show, toggleShow, onSubmit, plan }) => {
  const [form] = Form.useForm();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoading(true);
        const data = await fetchTeachers();
        setTeachers(data);
      } catch (error) {
        console.error("Erreur lors du chargement des enseignants :", error);
        message.error("Erreur lors du chargement des enseignants");
      } finally {
        setLoading(false);
      }
    };
    loadTeachers();
  }, []);

  useEffect(() => {
    if (plan?.teachers?._id) {
      setSelectedTeacherId(plan.teachers._id); // Définit l'enseignant actuel
      form.setFieldsValue({ teacherId: plan.teachers._id });
    } else if (plan?.teachers) {
      setSelectedTeacherId(plan.teachers); // fallback au cas où ce n'est pas un objet
      form.setFieldsValue({ teacherId: plan.teachers });
    }
  }, [plan, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (values.teacherId) {
        await onSubmit(plan._id, values.teacherId, plan.sujet._id);
        message.success("Enseignant affecté avec succès");
        toggleShow(); // Ferme le popup après soumission
        setSelectedTeacherId(""); // Réinitialise la sélection de l'enseignant
      } else {
        message.warning("Veuillez sélectionner un enseignant");
      }
    } catch (error) {
      console.error("Erreur lors de la validation :", error);
      message.error("Erreur lors de l'affectation de l'enseignant");
    }
  };

  return (
    <Modal
      title={
        <span>
          <EditOutlined style={{ marginRight: 8 }} />
          Update Planning - {plan?.sujet?.titre || "Sujet"}
        </span>
      }
      open={show}
      onCancel={toggleShow}
      footer={[
        <Button key="cancel" onClick={toggleShow}>
          Cancel
        </Button>,
        <Button
          key="update"
          type="primary"
          icon={<EditOutlined />}
          onClick={handleSubmit}
          loading={loading}
        >
          Update
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ teacherId: selectedTeacherId }}
      >
        <Form.Item
          name="teacherId"
          label="Select a teacher "
          rules={[
            { required: true, message: "You must select a teacher" },
          ]}
        >
          <Select
            placeholder="Choose Teacher"
            onChange={(value) => setSelectedTeacherId(value)}
            loading={loading}
            suffixIcon={<UserOutlined />}
          >
            {teachers.map((teacher) => (
              <Option key={teacher._id} value={teacher._id}>
                {teacher.firstName} {teacher.lastName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdatePlanModal;
