import { levenshtein, ngrams, normalizeString } from '../src/index';

// Petit demo montrant trois utilitaires : normalizeString, ngrams, levenshtein

console.log('--- normalizeString ---');
const raw = 'Institut Européen des Membranes, 1919 route de Mende, 34293 Montpellier Cédex 5';
console.log('raw: ', raw);
console.log('normalized:', normalizeString(raw));

console.log('\n--- ngrams (sans padding, normalize=true) ---');
const s = 'Le Havre';
console.log('input:', s);
console.log('ngrams(3):', ngrams(s, 3));
console.log('ngrams(2):', ngrams(s, 2));
console.log(
  'ngrams(3, { preserveWhitespace: true }):',
  ngrams(s, 3, { normalize: true, preserveWhitespace: true }),
);

console.log('\n--- levenshtein ---');
const a = 'Université Le Havre';
const b = 'Univ Le Havre';
const c = 'Université de Normandie';
console.log(`${a}  <->  ${b}  :`, levenshtein(a, b));
console.log(`${a}  <->  ${c}  :`, levenshtein(a, c));

console.log('\n--- Fin demo-utils ---');
