/**
 * Options pour la normalisation de chaînes.
 *
 * Chaque option est facultative — la valeur par défaut utilisée par `normalizeString`
 * est définie dans la signature de la fonction.
 */
export interface NormalizeOptions {
  /**
   * Convertit la chaîne en minuscules avant toute autre opération.
   * Par défaut : true.
   */
  toLowerCase?: boolean;

  /**
   * Supprime les diacritiques (accents) en appliquant NFD puis en retirant
   * les marques combinantes Unicode. Utile pour comparer « École » et « Ecole ».
   * Par défaut : true.
   */
  removeDiacritics?: boolean;

  /**
   * Remplace la ponctuation et les caractères non alphanumériques par des espaces.
   * Permet d'uniformiser les séparateurs (virgules, points, tirets, etc.).
   * Par défaut : true.
   */
  removePunctuation?: boolean;

  /**
   * Réduit les séquences d'espaces (tabs, retours ligne...) en un seul espace,
   * puis tronque les espaces en début/fin. Par défaut : true.
   */
  collapseWhitespace?: boolean;
}
