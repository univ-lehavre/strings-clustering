import { ngrams } from '.';
import { EmbeddingOptions, NgramOptions } from './types';

/**
 * Construit un vocabulaire d'n-grams à partir d'un corpus.
 *
 * Parcourt chaque document, génère ses n-grams (via `ngrams`) puis compte
 * la fréquence de chaque token. Le vocabulaire retourné est trié par
 * fréquence décroissante et ne contient que les tokens dont la fréquence est
 * supérieure ou égale à `opts.minCount`.
 *
 * @param corpus Tableau de documents (chaînes) servant à construire le vocabulaire.
 * @param opts Options :
 *  - n : taille des n-grams (défaut : 3)
 *  - minCount : fréquence minimale pour garder un token (défaut : 1)
 *  - ngramOpts : options passées à `ngrams`
 * @returns Tableau de tokens (n-grams) triés par fréquence décroissante.
 *
 * @example
 * const vocab = fitNgramVocabulary(['abcde','abxyz'], { n: 3 });
 */
export const fitNgramVocabulary = (
  corpus: string[],
  opts: EmbeddingOptions = { n: 3, minCount: 1 },
): string[] => {
  const n = opts.n ?? 3;
  const minCount = Math.max(1, opts.minCount ?? 1);
  const counts = new Map<string, number>();
  for (const doc of corpus) {
    const toks = ngrams(
      doc,
      n,
      opts.ngramOpts ?? { normalize: true, pad: false, padChar: '_', preserveWhitespace: false },
    );
    for (const t of toks) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const tokens = Array.from(counts.entries()).filter(([, c]) => c >= minCount);
  tokens.sort((a, b) => b[1] - a[1]);
  return tokens.map(([t]) => t);
};

/**
 * Convertit un texte en un vecteur TF (term-frequency) de taille `vocab.length`.
 *
 * Le vecteur est construit en comptant les n-grams présents dans `text` qui
 * figurent dans `vocab`. Le vecteur final est normalisé en norme L2 (unit length)
 * pour faciliter les comparaisons cosinus.
 *
 * @param text Texte d'entrée.
 * @param vocab Vocabulaire (liste de tokens correspondant aux dimensions du vecteur).
 * @param n Taille des n-grams utilisés pour tokenizer le texte (défaut : 3).
 * @param ngramOpts Options passées à `ngrams`.
 * @returns Vecteur de nombres (TF normalisé L2) de longueur `vocab.length`.
 *
 * @example
 * const vec = textToTfVector('abcde', ['abc','bcd','cde'], 3);
 */
export const textToTfVector = (
  text: string,
  vocab: string[],
  n: number = 3,
  ngramOpts?: NgramOptions,
): number[] => {
  const vec = new Array(vocab.length).fill(0);
  if (!text || vocab.length === 0) return vec;
  const toks = ngrams(
    text,
    n,
    ngramOpts ?? { normalize: true, pad: false, padChar: '_', preserveWhitespace: false },
  );
  const index = new Map<string, number>();
  vocab.forEach((t, i) => index.set(t, i));
  for (const t of toks) {
    const i = index.get(t);
    if (i !== undefined) vec[i]++;
  }
  // L2 normalization
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm);
  if (norm === 0) return vec;
  for (let i = 0; i < vec.length; i++) vec[i] = vec[i] / norm;
  return vec;
};

/**
 * Convertit un texte en embedding en utilisant un vocabulaire préalablement construit.
 *
 * @param text Texte à encoder.
 * @param vocab Vocabulaire d'n-grams.
 * @param opts Options d'embedding (notamment `n` et `ngramOpts`).
 * @returns Vecteur d'embedding (TF normalisé L2) correspondant au texte.
 */
export const embedText = (
  text: string,
  vocab: string[],
  opts: EmbeddingOptions = { n: 3 },
): number[] => {
  return textToTfVector(text, vocab, opts.n ?? 3, opts.ngramOpts);
};

/**
 * Concatène les embeddings pour un corpus entier.
 *
 * Retourne un tableau de vecteurs, un par document, dans le même ordre que
 * `texts`.
 *
 * @param texts Corpus (tableau de chaînes)
 * @param vocab Vocabulaire d'n-grams
 * @param opts Options d'embedding
 * @returns Tableau de vecteurs (embeddings) normalisés L2
 */
export const embedCorpus = (
  texts: string[],
  vocab: string[],
  opts: EmbeddingOptions = { n: 3 },
): number[][] => {
  return texts.map(t => embedText(t, vocab, opts));
};

/**
 * Calcule la similarité cosinus entre deux vecteurs.
 *
 * Les vecteurs peuvent être de longueurs différentes ; la fonction utilise la
 * longueur minimale commune pour le produit scalaire. Si l'un des vecteurs est
 * nul (norme 0), la similarité est 0.
 *
 * @param a Premier vecteur
 * @param b Deuxième vecteur
 * @returns Valeur de similarité cosinus dans [-1, 1]
 */
export const cosine = (a: number[], b: number[]): number => {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};
