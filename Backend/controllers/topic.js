import Period from "../models/Period.js";
import Sujet from "../models/topic.js";
import CV from "../models/cv.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export const addTopic = async (req, res) => {
  const { titre, description, year, company, technologies } = req.body;
  const files = req.files || [];
  const token = req.headers.authorization?.split(" ")[1]; // Vérifie si le token existe

  try {
    // Vérifier si le titre est fourni
    if (!titre) {
      return res
        .status(400)
        .json({ error: "Le titre du sujet est obligatoire." });
    }

    // Vérifier si des fichiers sont fournis
    if (files.length === 0) {
      return res
        .status(400)
        .json({ error: "Veuillez fournir au moins un document." });
    }

    // Vérifier la validité du token
    if (!token) {
      return res.status(401).json({ error: "Token manquant ou expiré." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Token invalide ou expiré." });
    }

    const studentId = decoded.userId;
    if (!studentId) {
      return res
        .status(401)
        .json({ error: "L'utilisateur doit être authentifié." });
    }

    // Vérification de la période active
    const now = new Date();
    const periodeActive = await Period.findOne({ type: "stageEte" });

    let isLate = false;
    if (!periodeActive || new Date(periodeActive.EndDate) < now) {
      isLate = true; // Marquer comme en retard si la période est terminée ou inexistante
    } else if (new Date(periodeActive.StartDate) > now) {
      return res.status(400).json({
        error: "La période de dépôt n'est pas encore ouverte.",
      });
    }

    // Vérifier si l'étudiant a déjà déposé 2 sujets
    const existingTopicsCount = await Sujet.countDocuments({
      student: studentId,
    });
    if (existingTopicsCount >= 2) {
      return res.status(400).json({
        error: "Chaque étudiant ne peut déposer que deux sujets maximum.",
      });
    }

    // Transformer les fichiers en une structure avec filename et title
    const documents = files.map((file) => ({
      filename: file.filename, // Nom généré du fichier
      title: file.originalname, // Nom d'origine du fichier (titre utilisateur)
    }));

    // Convertir `technologies` en tableau si c'est une chaîne JSON
    const parsedTechnologies =
      typeof technologies === "string" ? JSON.parse(technologies) : [];

    // Créer et enregistrer le sujet
    const sujet = new Sujet({
      titre,
      documents, // Enregistrer les fichiers avec leurs métadonnées
      description,
      year,
      company,
      technologies: parsedTechnologies,
      dateDepot: now,
      student: studentId,
      isLate,
    });

    await sujet.save();

    // Mise à jour du CV de l'étudiant
    let existingCV = await CV.findOne({ student: studentId });
    if (!existingCV) {
      // Si le CV n'existe pas, en créer un nouveau
      existingCV = new CV({
        student: studentId,
        topics: [sujet._id], // Ajouter le sujet au CV de l'étudiant
      });
    } else {
      // Si le CV existe, ajouter le sujet aux sujets existants
      existingCV.topics.push(sujet._id);
    }

    // Sauvegarder le CV de l'étudiant
    await existingCV.save();

    res.status(201).json({
      message: "Sujet déposé avec succès.",
      model: sujet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
      message: "Erreur lors du dépôt du sujet.",
    });
  }
};
// export const getTopics = async (req, res) => {
//   const token = req.headers.authorization?.split(" ")[1];

//   try {
//     if (!token) {
//       return res.status(401).json({ error: "Token manquant ou expiré." });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(token, JWT_SECRET);
//     } catch (err) {
//       return res.status(401).json({ error: "Token invalide ou expiré." });
//     }

//     const studentId = decoded.userId;
//     if (!studentId) {
//       return res
//         .status(401)
//         .json({ error: "L'utilisateur doit être authentifié." });
//     }

//     // Récupérer les sujets de l'étudiant
//     const topics = await Sujet.find({ student: studentId });

//     res.status(200).json({ topics });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "Erreur lors de la récupération des sujets." });
//   }
// };
export const getTopics = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    if (!token) {
      return res.status(401).json({ error: "Token manquant ou expiré." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Token invalide ou expiré." });
    }

    const userId = decoded.userId;
    const role = decoded.role; // 👈 On récupère le rôle depuis le token

    if (!userId || !role) {
      return res.status(401).json({ error: "Authentification invalide." });
    }

    let topics;

    if (role === "admin") {
      // 👑 Si c’est un admin, on récupère tous les sujets
      topics = await Sujet.find().populate("student", "firstName lastName email");
    } else if (role === "student") {
      // 🎓 Si c’est un étudiant, on récupère ses propres sujets
      topics = await Sujet.find({ student: userId });
    } else {
      return res.status(403).json({ error: "Rôle non autorisé." });
    }

    res.status(200).json({ topics });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des sujets." });
  }
};
