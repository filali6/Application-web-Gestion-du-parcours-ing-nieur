import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, InputNumber } from "antd";
import Swal from "sweetalert2";
import { addPfas } from "../../../services/pfaService";
import { getAllStudentsForPFA } from "../../../services/studentsService";
const { Option } = Select;

const AddPfaModal = ({ visible, onClose, onRefresh }) => {
  const [form] = Form.useForm();
  const [pfas, setPfas] = useState([{}]);
  const [students, setStudents] = useState([]);
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
    if (visible) {
      form.resetFields();
      setPfas([{}]);
      fetchStudents();
    }
  }, [visible]);

  const handleAddPfa = () => {
    setPfas([...pfas, {}]);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await addPfas(values.pfas);
      Swal.fire("Success", "PFAs successfully added", "success");
      onRefresh();
      onClose();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        Swal.fire("Error", error.response.data.error, "error");
      } else {
        Swal.fire("Error", "An error has occurred. Please try again.", "error");
      }
    }
  };
  const handleStudentChange = (value) => {
    if (value.length > 2) {
      form.setFieldsValue({ Students: value.slice(0, 2) }); // Limite la sélection à 2
    }
  };
  return (
    <Modal
      title="Add PFAs"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
    >
      <Form form={form} name="addPfaForm">
        {pfas.map((_, index) => (
          <div key={index} style={{ marginBottom: "20px" }}>
            <Form.Item
              name={["pfas", index, "title"]}
              label="Title"
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
              label="Year"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name={["pfas", index, "Students"]}
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
                {students.map((student) => (
                  <Option key={student._id} value={student._id}>
                    {student.firstName} {student.lastName}
                  </Option>
                ))}
              </Select>
            </Form.Item>


          </div>
        ))}
        <Button type="dashed" onClick={handleAddPfa} block>
          Add another topic
        </Button>
      </Form>
    </Modal>
  );
};

export default AddPfaModal;
