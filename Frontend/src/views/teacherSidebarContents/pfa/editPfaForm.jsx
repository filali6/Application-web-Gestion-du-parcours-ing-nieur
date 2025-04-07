import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, InputNumber } from "antd";
import Swal from "sweetalert2";
import { updatePfa } from "../../../services/pfaService";
import { getAllStudentsForPFA } from "../../../services/studentsService";

const { Option } = Select;

const EditPfaModal = ({ visible, onClose, onRefresh, editingPfa }) => {
  const [form] = Form.useForm();
  const [Students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await getAllStudentsForPFA();
      setStudents(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des étudiants", error);
    } finally {
      setLoadingStudents(false);
    }
  };
  useEffect(() => {
    if (editingPfa) {
      fetchStudents();

      form.setFieldsValue({
        ...editingPfa,
        Students: editingPfa.Students?.map((s) =>
          typeof s === "object" ? s._id : s
        ),
      });
    }
  }, [editingPfa, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updatePfa(editingPfa._id, values);
      Swal.fire("Success", "PFA successfully updated", "success");
      onRefresh();
      onClose();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        Swal.fire("Error", error.response.data.error, "error");
      } else {
        Swal.fire("Error", "Update failed. Please try again.", "error");
      }
    }
  };
  const validateStudents = (_, value) => {
    if (value && value.length > 2) {
      return Promise.reject(
        "Vous ne pouvez sélectionner que 2 étudiants maximum."
      );
    }
    return Promise.resolve();
  };
  const handleStudentChange = (value) => {
    if (value.length > 2) {
      form.setFieldsValue({ Students: value.slice(0, 2) }); // Limite la sélection à 2
    }
  };

  return (
    <Modal
      title="Modify the PFA"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="technologies"
          label="Technologies"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="mode" label="Mode" rules={[{ required: true }]}>
          <Select>
            <Option value="monome">Monôme</Option>
            <Option value="binome">Binôme</Option>
          </Select>
        </Form.Item>
        <Form.Item name="year" label="Year" rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="Students"
          label="Étudiants assignés"
        >
          <Select
            mode="multiple"
            allowClear
            loading={loadingStudents}
            disabled={loadingStudents}
            placeholder={
              loadingStudents
                ? "Chargement des étudiants..."
                : "Sélectionner un ou deux étudiants"
            }
            maxTagCount={2}
            onChange={handleStudentChange} // Gère la sélection d'étudiants
          >
            {Students.map((student) => (
              <Option key={student._id} value={student._id}>
                {student.firstName} {student.lastName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPfaModal;
