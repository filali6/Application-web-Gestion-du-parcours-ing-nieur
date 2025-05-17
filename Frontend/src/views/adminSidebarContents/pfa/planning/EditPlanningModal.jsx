import React, { useEffect, useState } from "react";
import { Modal, Form, InputNumber, DatePicker, TimePicker, Select } from "antd";
import Swal from "sweetalert2";
import moment from "moment";
import { updatePlanning } from "../../../../services/pfaService";
import { getAllTeachers } from "../../../../services/teacher";

const { Option } = Select;

// Liste des salles fixes
const FIXED_ROOMS = ["C10", "C11", "C12", "C14", "C15", "C16", "C17"];

const EditPlanningModal = ({ visible, onClose, onRefresh, editingPlanning }) => {
  const [form] = Form.useForm();
  const [teachers, setTeachers] = useState([]);

useEffect(() => {
  const init = async () => {
    if (visible && editingPlanning) {
      try {
        await fetchTeachers();
        form.setFieldsValue({
          ...editingPlanning,
          date: moment(editingPlanning.date),
          time: moment(editingPlanning.time, "HH:mm"),
          room: editingPlanning.room,
          duration: editingPlanning.duration,
          encadrant: editingPlanning.encadrantId, 
          rapporteur: editingPlanning.rapporteurId, 
        });
      } catch (error) {
        console.error("Erreur d'initialisation :", error);
      }
    }
  };
  init();
}, [visible, editingPlanning, form]);



  const fetchTeachers = async () => {
    try {
      const teacherData = await getAllTeachers();
      setTeachers(teacherData);
    } catch (error) {
      console.error("Erreur chargement enseignants:", error);
    }
  };

const handleSubmit = async () => {
  try {
    const values = await form.validateFields();
    const payload = {
      ...values,
      date: values.date.format("YYYY-MM-DD"),
      time: values.time.format("HH:mm"),
    };
    await updatePlanning(editingPlanning._id, payload);
    Swal.fire("Succès", "Soutenance mise à jour", "success");
    onRefresh();
    onClose();
  } catch (error) {
    console.error(error);
    const backendMessage = error?.response?.data?.message;
    Swal.fire("Erreur", backendMessage || "Échec de la mise à jour", "error");
  }
};


  return (
    <Modal
      title="Modifier une soutenance"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Enregistrer"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="room" label="Salle" rules={[{ required: true }]}>
          <Select placeholder="Sélectionner une salle">
            {FIXED_ROOMS.map((room) => (
              <Option key={room} value={room}>
                {room}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="date" label="Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="time" label="Heure" rules={[{ required: true }]}>
          <TimePicker format="HH:mm" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="duration" label="Durée (minutes)" rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} min={10} />
        </Form.Item>

<Form.Item name="encadrant" label="Encadrant" rules={[{ required: true }]}>
  <Select placeholder="Sélectionner un encadrant" showSearch optionFilterProp="children">
    {teachers.map((t) => (
      <Option key={t._id} value={t._id}>
        {t.firstName} {t.lastName}
      </Option>
    ))}
  </Select>
</Form.Item>

<Form.Item name="rapporteur" label="Rapporteur" rules={[{ required: true }]}>
  <Select placeholder="Sélectionner un rapporteur" showSearch optionFilterProp="children">
    {teachers.map((t) => (
      <Option key={t._id} value={t._id}>
        {t.firstName} {t.lastName}
      </Option>
    ))}
  </Select>
</Form.Item>


      </Form>
    </Modal>
  );
};

export default EditPlanningModal;
