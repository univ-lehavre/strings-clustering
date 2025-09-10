import { ngrams } from '.';
import { EmbeddingOptions, NgramOptions } from './types';

/**
 * Construit un vocabulaire d'n-grams à partir d'un corpus.
 * Retourne un tableau de tokens triés par fréquence décroissante.
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
 * Convertit un texte en un vecteur TF (normalisé L2) selon un vocabulaire donné.
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
 * Embeds a single text using a vocabulary built previously.
 */
export const embedText = (
  text: string,
  vocab: string[],
  opts: EmbeddingOptions = { n: 3 },
): number[] => {
  return textToTfVector(text, vocab, opts.n ?? 3, opts.ngramOpts);
};

/**
 * Embeds a corpus of texts using a vocabulary built previously.
 */
export const embedCorpus = (
  texts: string[],
  vocab: string[],
  opts: EmbeddingOptions = { n: 3 },
): number[][] => {
  return texts.map(t => embedText(t, vocab, opts));
};

/**
 * Cosine similarity between two vectors.
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
