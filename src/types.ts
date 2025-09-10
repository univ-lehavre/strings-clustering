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
   * puis tronque les espaces en début/fin.
   * Par défaut : true.
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
 * Options pour les embeddings simples basés sur des n-grams et TF (term-frequency).
 *
 * Ces options contrôlent la taille des n-grams utilisés pour la tokenisation,
 * le filtrage des tokens peu fréquents lors de la construction du vocabulaire,
 * et les options transmises à la fonction de génération de n-grams.
 *
 * @property {number} [n] - Taille des n-grams (par défaut : 3).
 * @property {number} [minCount] - Fréquence minimale requise pour qu'un token
 *   soit inclus dans le vocabulaire (par défaut : 1). Utiliser une valeur
 *   supérieure aide à supprimer le bruit (tokens rares).
 * @property {NgramOptions} [ngramOpts] - Options passées à la fonction `ngrams`
 *   lors de la tokenisation (ex. padding, normalisation, préservation des espaces).
 */
export type EmbeddingOptions = {
  /**
   * Taille des n-grams (par défaut : 3).
   */
  n?: number;
  /**
   * Fréquence minimale d'un token pour être dans le vocabulaire (défaut : 1).
   */
  minCount?: number;
  /**
   * Options passées à ngrams.
   */
  ngramOpts?: NgramOptions;
  /**
   * Méthode de pondération à utiliser pour les embeddings :
   * - 'tf' (par défaut) : pondération par fréquence brute (term-frequency)
   * - 'tfidf' : pondération TF * IDF (IDF calculé sur le corpus fourni à `embedCorpus`)
   */
  weighting?: 'tf' | 'tfidf';
};
