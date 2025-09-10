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

/**
 * Options pour la génération de n-grams.
 */
export type NgramOptions = {
  /**
   * Si true, applique `normalizeString` avant de générer les n-grams (par défaut : true).
   */
  normalize?: boolean;
  /**
   * Si true, ajoute un padding avec `padChar` en début et fin pour inclure les bords (par défaut : false).
   */
  pad?: boolean;
  /** Caractère utilisé pour le padding (par défaut : '_'). */
  padChar?: string;
  /**
   * Si true, conserve les espaces dans la chaîne avant génération; sinon les espaces sont supprimés (par défaut : false).
   */
  preserveWhitespace?: boolean;
  /**
   * Options passées à `normalizeString` si `normalize` est true.
   */
  normalizeOpts?: NormalizeOptions;
};

/**
 * Options pour les embeddings simples basés sur n-grams et TF.
 */
export type EmbeddingOptions = {
  n?: number; // taille des n-grams (défaut : 3)
  minCount?: number; // fréquence minimale d'un token pour être dans le vocabulaire (défaut : 1)
  ngramOpts?: NgramOptions; // options passées à ngrams
};
