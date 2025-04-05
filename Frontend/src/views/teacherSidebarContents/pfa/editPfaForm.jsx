import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, InputNumber } from "antd";
import Swal from "sweetalert2";
import { updatePfa } from "../../../services/pfaService";
import { getAllStudentsForPFA } from "../../../services/studentService";

const { Option } = Select;

const EditPfaModal = ({ visible, onClose, onRefresh, editingPfa }) => {
  const [form] = Form.useForm();
  const [Students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Chargement des étudiants par année
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

  // Pré-remplissage du formulaire + chargement des étudiants
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

  // Soumission du formulaire
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updatePfa(editingPfa._id, values);
      Swal.fire("Succès", "PFA mis à jour avec succès", "success");
      onRefresh();
      onClose();
    } catch (error) {
      Swal.fire(
        "Erreur",
        error.response?.data?.error ||
          "Échec de la mise à jour. Veuillez réessayer.",
        "error"
      );
    }
  };

  // Validation des étudiants (maximum 2)
  const validateStudents = (_, value) => {
    if (value && value.length > 2) {
      return Promise.reject(
        "Vous ne pouvez sélectionner que 2 étudiants maximum."
      );
    }
    return Promise.resolve();
  };

  // Gestion de la sélection des étudiants, en bloquant plus de 2 sélections
  const handleStudentChange = (value) => {
    if (value.length > 2) {
      form.setFieldsValue({ Students: value.slice(0, 2) }); // Limite la sélection à 2
    }
  };

  return (
    <Modal
      title="Modifier le PFA"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="OK"
      cancelText="Annuler"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Titre" rules={[{ required: true }]}>
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

        <Form.Item name="year" label="Année" rules={[{ required: true }]}>
          <InputNumber
            style={{ width: "100%" }}
            onChange={() => fetchStudents()}
          />
        </Form.Item>

        <Form.Item
          name="Students"
          label="Étudiants assignés"
          rules={[
            { required: true, message: "Veuillez sélectionner des étudiants" },
            { validator: validateStudents },
          ]}
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
