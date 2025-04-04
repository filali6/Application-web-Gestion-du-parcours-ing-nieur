import React, { useEffect } from "react";
import { Modal, Form, Input, Select, InputNumber } from "antd";
import Swal from "sweetalert2";
import { updatePfa } from "../../../services/pfaService";

const { Option } = Select;

const EditPfaModal = ({ visible, onClose, onRefresh, editingPfa }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingPfa) form.setFieldsValue(editingPfa);
  }, [editingPfa, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updatePfa(editingPfa._id, values);
      Swal.fire("Succès", "PFA mis à jour avec succès", "success");
      onRefresh();
      onClose();
    } catch (error) {
      Swal.fire("Erreur", "Échec de la mise à jour", "error");
    }
  };

  return (
    <Modal
      title="Modifier le PFA"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
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
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPfaModal;
