import type { NormalizeOptions } from './types';

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
