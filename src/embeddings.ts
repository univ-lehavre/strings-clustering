import { Brand } from 'effect';
import { allNgrams, ngrams } from './utils';
import type {
  EmbeddingOptions,
  Corpus,
  NgramOptions,
  FitNgramVocabulary,
  TextToTfVector,
  AllNgramsOptions,
  Token,
} from './types';

export const tokensCorpus = (corpus: string[], opts: AllNgramsOptions): Token[][] => {
  const results: Token[][] = [];
  for (const doc of corpus) {
    const toks = allNgrams(doc, opts);
    results.push(toks);
  }
  return results;
};

export type Frequency = number & Brand.Brand<'Frequency'>;
export const asFrequency = Brand.nominal<Frequency>();
export type TfCorpus = Frequency[][] & Brand.Brand<'TfCorpus'>;
export const asTfCorpus = Brand.nominal<TfCorpus>();

export const tfCorpus = (tokensCorpus: Token[][]): Map<Token, Frequency>[] => {
  const countsCorpus: Map<Token, Frequency>[] = [];
  for (const doc of tokensCorpus) {
    const counts = new Map<Token, number>();
    const tf = new Map<Token, Frequency>();
    for (const t of doc) counts.set(t, (counts.get(t) ?? 0) + 1);
    const total = doc.length;
    for (const [t, c] of counts.entries()) tf.set(t, asFrequency(c / total));
    countsCorpus.push(tf);
  }
  return countsCorpus;
};

export const vocabulary = (tfCorpus: Map<Token, Frequency>[]): Token[] => {
  const vocabSet = new Set<Token>();
  for (const doc of tfCorpus) {
    for (const token of doc.keys()) {
      vocabSet.add(token);
    }
  }
  return Array.from(vocabSet);
};

export const idf = (tfCorpus: Map<Token, Frequency>[], vocabulary: Token[]): Map<Token, number> => {
  const df = new Map<Token, number>();
  for (const token of vocabulary) {
    for (const doc of tfCorpus) {
      if (doc.has(token)) {
        df.set(token, (df.get(token) ?? 0) + 1);
      }
    }
  }
  const idf = new Map<Token, number>();
  const N = tfCorpus.length;
  for (const token of vocabulary) {
    const docFreq = df.get(token) ?? 0;
    idf.set(token, Math.log((N + 1) / (docFreq + 1)) + 1);
  }
  return idf;
};

export const tfidfCorpus = (
  tfCorpus: Map<Token, Frequency>[],
  vocabulary: Token[],
): Map<Token, number>[] => {
  const idfValues = idf(tfCorpus, vocabulary);
  const tfidfCorpus: Map<Token, number>[] = [];
  for (const doc of tfCorpus) {
    const tfidfDoc = new Map<Token, number>();
    for (const [token, tf] of doc.entries()) {
      const idfValue = idfValues.get(token) ?? 0;
      tfidfDoc.set(token, tf * idfValue);
    }
    tfidfCorpus.push(tfidfDoc);
  }
  return tfidfCorpus;
};

/**
 * Applique la normalisation softmax à chaque document TF-IDF.
 * @param tfidfDocs Tableau de Map<Token, number> (documents TF-IDF)
 * @returns Tableau de Map<Token, number> où chaque document est normalisé softmax
 */
export const softmaxTfidf = (tfidfDocs: Map<Token, number>[]): Map<Token, number>[] => {
  return tfidfDocs.map(doc => {
    // Pour la stabilité numérique, soustraire le max avant l'exponentielle
    const values = Array.from(doc.values());
    const maxVal = Math.max(...values);
    const expValues = values.map(v => Math.exp(v - maxVal));
    const sumExp = expValues.reduce((acc, v) => acc + v, 0);
    const tokens = Array.from(doc.keys());
    const normalized = new Map<Token, number>();
    for (let i = 0; i < tokens.length; i++) {
      normalized.set(tokens[i], expValues[i] / sumExp);
    }
    return normalized;
  });
};

// Une fonction transformant une matrice sparse Map<Token, number>[] en une matrice dense number[][]
export const sparseToDense = (
  sparseDocs: Map<Token, number>[],
  vocabulary: Token[],
): number[][] => {
  const denseDocs: number[][] = [];
  const tokenIndex = new Map<Token, number>();
  vocabulary.forEach((token, idx) => tokenIndex.set(token, idx));
  for (const doc of sparseDocs) {
    const denseDoc = new Array(vocabulary.length).fill(0);
    for (const [token, value] of doc.entries()) {
      const idx = tokenIndex.get(token);
      if (idx !== undefined) {
        denseDoc[idx] = value;
      }
    }
    denseDocs.push(denseDoc);
  }
  return denseDocs;
};

export const asCorpus = Brand.nominal<Corpus>();
export const asFitNgramVocabulary = Brand.nominal<FitNgramVocabulary>();

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
  corpus: Corpus,
  opts: EmbeddingOptions = { n: 3, minCount: 1 },
): FitNgramVocabulary => {
  const counts = new Map<string, number>();
  for (const doc of corpus) {
    const toks = ngrams(doc, opts.n, opts.ngramOpts);
    for (const t of toks) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  // Récupération des tokens et de leurs comptes
  const tokens = Array.from(counts.entries());
  // Suppression de tous les tokens en dessous de minCount
  const filtered_tokens = tokens.filter(([, c]) => c >= opts.minCount);
  // Tri par fréquence décroissante
  filtered_tokens.sort((a, b) => b[1] - a[1]);
  // Extraction de la liste de tokens
  const result = filtered_tokens.map(([t]) => t);
  return asFitNgramVocabulary(result);
};

const TextToTfVector = Brand.nominal<TextToTfVector>();

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
): TextToTfVector => {
  const vec = new Array(vocab.length).fill(0);
  if (!text || vocab.length === 0) return TextToTfVector(vec);
  const toks = ngrams(text, n, ngramOpts);
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
  if (norm === 0) return TextToTfVector(vec);
  for (let i = 0; i < vec.length; i++) vec[i] = vec[i] / norm;
  return TextToTfVector(vec);
};

/**
 * Convertit un texte en embedding en utilisant un vocabulaire préalablement construit.
 *
 * @param text Texte à encoder.
 * @param vocab Vocabulaire d'n-grams.
 * @param opts Options d'embedding (notamment `n` et `ngramOpts`).
 * @returns Vecteur d'embedding (TF normalisé L2) correspondant au texte.
 */
export const embedText = (text: string, vocab: string[], opts: EmbeddingOptions): number[] => {
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
  opts: EmbeddingOptions,
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
