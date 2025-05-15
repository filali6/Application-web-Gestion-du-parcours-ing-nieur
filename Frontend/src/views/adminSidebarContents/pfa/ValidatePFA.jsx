import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Spin, Button } from "antd";
import Swal from "sweetalert2";
import {
  fetchChoicesByStudent,
  fetchPFAs,
  toggleAffectationStatus,
  sendPfaValidationLink,
} from "../../../services/pfaService";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ValidatePFA = () => {
  const [studentChoices, setStudentChoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [affectationStatus, setAffectationStatus] = useState("hidden");
  const [statusLoading, setStatusLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [choicesRes, pfasRes] = await Promise.all([
          fetchChoicesByStudent(),
          fetchPFAs(),
        ]);

        setStudentChoices(choicesRes.data);
        if (pfasRes.length > 0) {
          setAffectationStatus(pfasRes[0].affectationStatus || "hidden");
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Erreur", "Chargement impossible.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleToggleStatus = async () => {
    const newStatus = affectationStatus === "published" ? "false" : "true";
    setStatusLoading(true);
    try {
      const res = await toggleAffectationStatus(newStatus);
      setAffectationStatus(newStatus === "true" ? "published" : "hidden");

      Swal.fire({
        icon: "success",
        title: "Succès",
        text: res.data.message || "Statut mis à jour.",
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Erreur lors de la mise à jour du statut d’affectation.",
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const columns = [
    {
      title: "Titre du sujet",
      dataIndex: "subjectTitle",
      key: "subjectTitle",
    },
    {
      title: "Priorité",
      dataIndex: "priority",
      key: "priority",
    },
    {
      title: "Accepté par l'enseignant",
      dataIndex: "acceptedByTeacher",
      key: "acceptedByTeacher",
      render: (accepted) =>
        accepted ? <Tag color="green">Oui</Tag> : <Tag color="red">Non</Tag>,
    },
    {
      title: "Validé",
      dataIndex: "validation",
      key: "validation",
      render: (valide) =>
        valide ? <Tag color="green">Oui</Tag> : <Tag color="red">Non</Tag>,
    },
    {
      title: "Statut d’affectation",
      key: "affectationStatus",
      render: () => (
        <Tag color={affectationStatus === "published" ? "green" : "orange"}>
          {affectationStatus === "published" ? "Publié" : "Masqué"}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>Choix des PFAs par Étudiant</Title>

      {/* Boutons */}
      <div
        style={{
          marginTop: 24,
          marginBottom: 16,
          display: "flex",
          gap: "12px",
        }}
      >
        <Button type="primary" onClick={() => navigate("/pfa/auto-assign")}>
          Affectation Automatique
        </Button>

        <Button
          style={{ backgroundColor: "#24D26D", color: "white" }}
          onClick={() => navigate("/pfa/assign-manual")}
        >
          Affectation Manuelle
        </Button>

        <Button
          style={{ backgroundColor: "#FE4B4B", color: "white" }}
          danger={affectationStatus === "published"}
          loading={statusLoading}
          onClick={handleToggleStatus}
        >
          {affectationStatus === "published"
            ? "Masquer l’affectation"
            : "Publier l’affectation"}
        </Button>

        <Button
          style={{ backgroundColor: "#EBBD04", color: "white" }}
          type="dashed"
          onClick={async () => {
            const { value: formValues } = await Swal.fire({
              title: "Envoyer le lien PFA",
              html: `
        <input id="link-input" class="swal2-input" placeholder="Lien vers la liste">
        <select id="type-input" class="swal2-select">
          <option value="premier">Premier envoi</option>
          <option value="modifié">Envoi modifié</option>
        </select>
      `,
              focusConfirm: false,
              preConfirm: () => {
                const link = document.getElementById("link-input").value;
                const type = document.getElementById("type-input").value;
                if (!link) {
                  Swal.showValidationMessage("Le lien est requis !");
                }
                return { link, type };
              },
            });

            if (formValues) {
              try {
                const { link, type } = formValues;
                await sendPfaValidationLink(link, type);
                Swal.fire(
                  "Succès",
                  "Lien envoyé par email avec succès !",
                  "success"
                );
              } catch (error) {
                console.error(error);
                Swal.fire("Erreur", "Échec de l’envoi du lien.", "error");
              }
            }
          }}
        >
          Envoyer lien par mail
        </Button>
      </div>

      {loading ? (
        <Spin size="large" />
      ) : studentChoices.length === 0 ? (
        <p>Aucun choix trouvé.</p>
      ) : (
        studentChoices.map((student) => (
          <div key={student.studentId} style={{ marginBottom: "40px" }}>
            <Title level={5}>
              <UserOutlined style={{ marginRight: 8 }} />
              {student.studentName}
            </Title>
            <Table
              columns={columns}
              dataSource={student.choices.map((choice, idx) => ({
                ...choice,
                key: idx,
              }))}
              pagination={false}
              bordered
              size="small"
            />
          </div>
        ))
      )}
    </div>
  );
};

export default ValidatePFA;
