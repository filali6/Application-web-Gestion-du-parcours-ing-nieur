import React, { useEffect, useState } from "react";
import { Button, Typography, message, Select, Spin, Switch } from "antd";
import { fetchPFAs, assignPfaManually } from "../../../services/pfaService";
import { getStudents } from "../../../services/studentsService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons"; // ✅ Ajouté

const { Title } = Typography;
const { Option } = Select;

const AssignPfaManually = () => {
  const [pfas, setPfas] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPfa, setSelectedPfa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forceAssign, setForceAssign] = useState(false);
  const navigate = useNavigate(); // ✅ Ajouté

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pfaRes, studentRes] = await Promise.all([
          fetchPFAs(),
          getStudents(),
        ]);

        const publishedPFAs = pfaRes.filter(
          (pfa) => pfa.status === "published"
        );
        setPfas(publishedPFAs);
        setStudents(studentRes || []);
      } catch (err) {
        Swal.fire("Erreur", "Erreur lors du chargement des données.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssign = async () => {
    if (!selectedStudent || !selectedPfa) {
      return Swal.fire(
        "Erreur",
        "Veuillez sélectionner un étudiant et un PFA.",
        "warning"
      );
    }

    Swal.fire({
      title: "Confirmer l’affectation ?",
      html: `<strong>Étudiant :</strong> ${selectedStudent.firstName} ${selectedStudent.lastName}<br/>
             <strong>PFA :</strong> ${selectedPfa.title}<br/>
             <strong>Mode :</strong> ${forceAssign ? "Forcé" : "Standard"}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Affecter",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const result = await assignPfaManually(
            selectedPfa._id,
            selectedStudent._id,
            forceAssign
          );

          Swal.fire(
            "Succès",
            result.message || "Affectation réussie !",
            "success"
          );
          setSelectedStudent(null);
          setSelectedPfa(null);
        } catch (error) {
          const errorMsg =
            error?.response?.data?.error || "Erreur inconnue survenue.";
          Swal.fire("Erreur", errorMsg, "error");
        }
      }
    });
  };

  if (loading) return <Spin size="large" />;

  return (
    <div style={{ padding: 24 }}>
      {/* ✅ Bouton de retour ajouté */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/pfa/validate-pfa")}
        style={{ marginBottom: 16, paddingLeft: 0 }}
      >
        Retour à la validation
      </Button>

      <Title level={3}>Affectation Manuelle des PFAs</Title>

      <div style={{ marginBottom: 16 }}>
        <label>Étudiant :</label>
        <Select
          style={{ width: 350, marginLeft: 8 }}
          placeholder="Choisir un étudiant"
          value={selectedStudent?._id}
          onChange={(value) => {
            const student = students.find((s) => s._id === value);
            setSelectedStudent(student);
          }}
          showSearch
          optionFilterProp="children"
        >
          {students.map((student) => (
            <Option key={student._id} value={student._id}>
              {student.firstName} {student.lastName} ({student.email})
            </Option>
          ))}
        </Select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>PFA disponible :</label>
        <Select
          style={{ width: 400, marginLeft: 8 }}
          placeholder="Choisir un PFA"
          value={selectedPfa?._id}
          onChange={(value) => {
            const pfa = pfas.find((p) => p._id === value);
            setSelectedPfa(pfa);
          }}
          showSearch
          optionFilterProp="children"
        >
          {pfas.map((pfa) => (
            <Option key={pfa._id} value={pfa._id}>
              {pfa.title}
            </Option>
          ))}
        </Select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Mode Forcé :</label>
        <Switch checked={forceAssign} onChange={setForceAssign} />
      </div>

      <Button
        type="primary"
        onClick={handleAssign}
        disabled={!selectedPfa || !selectedStudent}
      >
        Affecter l’Étudiant au PFA
      </Button>
    </div>
  );
};

export default AssignPfaManually;
