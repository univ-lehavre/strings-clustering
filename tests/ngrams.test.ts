import { ngrams } from '../src/index';

describe('ngrams', () => {
  it('génère des n-grams simples', () => {
    expect(ngrams('abcde', 3)).toEqual(['abc', 'bcd', 'cde']);
  });

  it('pad ajoute des bordures', () => {
    expect(ngrams('abc', 3, { pad: true, padChar: '_' })).toEqual([
      '__a',
      '_ab',
      'abc',
      'bc_',
      'c__',
    ]);
  });

  it('enlève les espaces par défaut et normalise', () => {
    expect(ngrams('Écôle  1', 2)).toEqual(['ec', 'co', 'ol', 'le', 'e1']);
  });

  it('preserveWhitespace true conserve les espaces', () => {
    expect(ngrams('a b c', 2, { preserveWhitespace: true, normalize: true })).toEqual([
      'a ',
      ' b',
      'b ',
      ' c',
    ]);
  });
});
