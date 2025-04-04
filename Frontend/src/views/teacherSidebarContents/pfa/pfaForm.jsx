import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, InputNumber } from "antd";
import Swal from "sweetalert2";
import { addPfas } from "../../../services/pfaService";

const { Option } = Select;

const AddPfaModal = ({ visible, onClose, onRefresh }) => {
  const [form] = Form.useForm();
  const [pfas, setPfas] = useState([{}]);

  // 👇 Ce useEffect vide le formulaire à chaque ouverture
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setPfas([{}]);
    }
  }, [visible]);

  const handleAddPfa = () => {
    setPfas([...pfas, {}]);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await addPfas(values.pfas);
      Swal.fire("Succès", "PFAs ajoutés avec succès", "success");
      onRefresh();
      onClose();
    } catch (error) {
      Swal.fire("Erreur", "Vérifiez les informations saisies", "error");
    }
  };

  return (
    <Modal
      title="Ajouter des PFAs"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
    >
      <Form form={form} name="addPfaForm">
        {pfas.map((_, index) => (
          <div key={index} style={{ marginBottom: "20px" }}>
            <Form.Item
              name={["pfas", index, "title"]}
              label="Titre"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={["pfas", index, "description"]}
              label="Description"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name={["pfas", index, "technologies"]}
              label="Technologies"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={["pfas", index, "mode"]}
              label="Mode"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="monome">Monôme</Option>
                <Option value="binome">Binôme</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name={["pfas", index, "year"]}
              label="Année"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </div>
        ))}
        <Button type="dashed" onClick={handleAddPfa} block>
          Ajouter un autre sujet
        </Button>
      </Form>
    </Modal>
  );
};

export default AddPfaModal;
