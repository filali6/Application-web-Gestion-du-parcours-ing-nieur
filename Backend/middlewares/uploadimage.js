import multer from "multer";

// Configuration du stockage des fichiers en mémoire
const fileStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg", // JPEG
    "image/png", // PNG
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Seules les images JPEG et PNG sont autorisées."));
  }
  cb(null, true); // Accepte le fichier
};

// Configuration de Multer
export const uploadImage = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de taille à 5 Mo
});
