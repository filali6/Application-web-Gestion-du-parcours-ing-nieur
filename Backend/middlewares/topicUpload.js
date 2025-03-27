import multer from "multer";
import path from "path";
import fs from "fs";

// Configuration du stockage des fichiers
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Dossier où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom unique
  },
});

// Fonction pour valider les types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".doc", ".docx"];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(fileExtension)) {
    cb(null, true); // Accepte le fichier
  } else {
    cb(new Error("Seuls les fichiers PDF et Word sont autorisés!"), false); // Rejette le fichier
  }
};

// Configuration de Multer
export const topicUpload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,

  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de taille à 5 Mo
});

// Gestion du transcript (supprimer l'ancien fichier si un nouveau est téléchargé)
export const handleTranscript = async (student, newTranscriptPath) => {
  if (newTranscriptPath) {
    if (student.transcript) {
      fs.unlinkSync(student.transcript); // Supprime l'ancien fichier
    }
    student.transcript = newTranscriptPath; // Met à jour le chemin du transcript
  }
};
