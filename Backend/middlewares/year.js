export const yearFilter = (req, res, next) => {
  const { annee, inHistory } = req.query;

  // Si une année est fournie
  if (annee) {
    const year = Number(annee);

    // Vérifier si on filtre dans l'historique
    if (inHistory === "true") {
      req.yearFilter = { "history.year": year }; // Recherche dans history.year
    } else {
      req.yearFilter = { year }; // Recherche dans year
    }
  } else {
    req.yearFilter = {}; // Pas de filtre si aucune année n'est fournie
  }

  next();
};
