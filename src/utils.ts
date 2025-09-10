import type { NgramOptions, NormalizeOptions } from './types';

/**
 * Calcule la distance de Levenshtein entre deux chaînes de caractères.
 *
 * La distance de Levenshtein est le nombre minimum d'opérations requises pour transformer
 * une chaîne en une autre, les opérations étant l'insertion, la suppression ou la substitution
 * d'un caractère.
 *
 * @param a La première chaîne.
 * @param b La deuxième chaîne.
 * @returns La distance de Levenshtein entre les deux chaînes.
 *
 * @example
 * const distance = levenshtein('chat', 'chats');
 * console.log(distance); // 1
 */
export const levenshtein = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
};

/**
 * Génère les n-grams de taille `n` pour une chaîne donnée.
 *
 * Comportement par défaut : normalise la chaîne (minuscules, suppression des diacritiques,
 * suppression de la ponctuation, collapse des espaces), supprime les espaces, puis
 * génère des n-grams de caractères.
 *
 * @param s Chaîne d'entrée
 * @param n Taille des n-grams (par défaut : 3)
 * @param opts Options de génération
 * @returns Tableau de n-grams (chaînes)
 *
 * @example
 * ngrams('abcde', 3) // ['abc','bcd','cde']
 */
export const ngrams = (
  s: string,
  n: number = 3,
  opts: NgramOptions = { normalize: true, pad: false, padChar: '_', preserveWhitespace: false },
): string[] => {
  const size = Math.max(1, Math.floor(n));
  let str = String(s ?? '');

  if (opts.normalize ?? true) {
    str = normalizeString(str, opts.normalizeOpts ?? undefined);
  }

  if (!opts.preserveWhitespace) {
    str = str.replace(/\s+/g, '');
  }

  if (opts.pad) {
    const padChar = (opts.padChar ?? '_') || '_';
    const pad = padChar.repeat(Math.max(0, size - 1));
    str = pad + str + pad;
  }

  const out: string[] = [];
  if (str.length === 0) return out;

  if (str.length <= size) {
    out.push(str);
    return out;
  }

  for (let i = 0; i <= str.length - size; i++) {
    out.push(str.substr(i, size));
  }
  return out;
};

/**
 * Normalise une chaîne de caractères pour comparaison.
 *
 * - retire les accents (NFD + suppression des marques)
 * - met en minuscules (optionnel)
 * - remplace les caractères non alphanumériques par des espaces (optionnel)
 * - réduit les espaces multiples en un seul et tronque
 *
 * @param s Chaîne d'entrée
 * @param opts Options de normalisation
 */
export const normalizeString = (
  s: string,
  opts: NormalizeOptions = {
    toLowerCase: true,
    removeDiacritics: true,
    removePunctuation: true,
    collapseWhitespace: true,
  },
): string => {
  let out = String(s ?? '');
  if (opts.removeDiacritics) {
    out = out.normalize('NFD').replace(/\p{M}/gu, '');
  }
  if (opts.toLowerCase) {
    out = out.toLowerCase();
  }
  if (opts.removePunctuation) {
    // Keep letters and numbers; replace other chars with space
    out = out.replace(/[^\p{L}\p{N}]+/gu, ' ');
  }
  if (opts.collapseWhitespace) {
    out = out.replace(/\s+/g, ' ').trim();
  }
  return out;
};
