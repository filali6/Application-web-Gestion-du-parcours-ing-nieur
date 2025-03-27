import multer from "multer";

// Configuration du stockage des fichiers en mémoire
const fileStorage = multer.memoryStorage();

// Filtre pour autoriser uniquement les fichiers PDF et Excel
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf", // PDF
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel (.xlsx)
    "application/vnd.ms-excel", // Excel (.xls)
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Seuls les fichiers PDF et Excel sont autorisés."));
  }
  cb(null, true); // Accepte le fichier
};

// Configuration de Multer
export const upload = multer({
  storage: fileStorage, // Utilise la mémoire pour stocker le fichier
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de taille à 5 Mo
});
