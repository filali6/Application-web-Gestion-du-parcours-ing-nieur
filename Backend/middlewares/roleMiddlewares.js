import Student from "../models/Student.js";
///////////////ADMIN ROLE MIDDLEWARES////////////
export const isAdmin = (req, res, next) => {
  if (req.auth.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

///////////////TEACHER ROLE MIDDLEWARES////////////
export const isTeacher = (req, res, next) => {
  if (req.auth.role !== "teacher") {
    return res.status(403).json({ error: "Access denied. Teachers only." });
  }
  next();
};

///////////////STUDENT ROLE MIDDLEWARES////////////
export const isStudent = (req, res, next) => {
  if (req.auth.role !== "student") {
    return res.status(403).json({ error: "Access denied. Students only." });
  }
  next();
};

export const iSStudent3rdYear = async (req, res, next) => {
  try {
    const studentId = req.auth.userId; // Supposons que `userId` est dans `req.auth`
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Étudiant non trouvé.",
      });
    }

    if (student.level !== 3) {
      return res.status(403).json({
        message: "Cet accès est réservé aux étudiants de 3ème année.",
      });
    }

    // Ajouter l'objet `student` à req pour les middlewares suivants
    req.student = student;

    next();
  } catch (error) {
    console.error("Erreur dans le middleware iSStudent3rdYear :", error);
    return res.status(500).json({
      error: "Une erreur interne est survenue.",
    });
  }
};

///////////////ADMIN OR TEACHER ROLE MIDDLEWARES////////////
export const isAdminOrTeacher = (req, res, next) => {
  const { role } = req.auth;
  if (role !== "admin" && role !== "teacher") {
    return res
      .status(403)
      .json({ error: "Access denied. Admins or Teachers only." });
  }
  next();
};
///////////////ADMIN OR TEACHER ROLE MIDDLEWARES////////////
export const isAdminOrStudent = (req, res, next) => {
  const { role } = req.auth;
  if (role !== "admin" && role !== "student") {
    return res
      .status(403)
      .json({ error: "Access denied. Admins or student only." });
  }
  next();
};
///////////////STUDENT OR ADMIN OR TEACHER ROLE MIDDLEWARES////////////
export const isStudentOrAdminOrTeacher = (req, res, next) => {
  const { role } = req.auth;
  if (role !== "student" && role !== "admin" && role !== "teacher") {
    return res
      .status(403)
      .json({ error: "Access denied. Students or Admins or Teachers only." });
  }
  next();
};


///////////////STUDENT OR ADMIN OR TEACHER ROLE MIDDLEWARES////////////
export const iSStudent2ndYear = async (req, res, next) => {
  try {
    const studentId = req.auth.userId; 
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Étudiant non trouvé.",
      });
    }

    if (student.level !== 2) {
      return res.status(403).json({
        message: "Cet accès est réservé aux étudiants de 2ème année.",
      });
    }

    // Ajouter l'objet student à req pour les middlewares suivants
    req.student = student;

    next();
  } catch (error) {
    console.error("Erreur dans le middleware iSStudent2ndYear :", error);
    return res.status(500).json({
      error: "Une erreur interne est survenue.",
    });
  }
};
