import { levenshtein, ngrams, normalizeString } from '../src/utils';

describe('levenshtein', () => {
  it('renvoie 0 pour deux chaînes identiques', () => {
    expect(levenshtein('abc', 'abc')).toBe(0);
  });

  it('renvoie la longueur pour une chaîne vide', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
  });

  it('calcule correctement la distance', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('flaw', 'lawn')).toBe(2);
    expect(levenshtein('gumbo', 'gambol')).toBe(2);
  });

  it('gère des chaînes longues et complexes', () => {
    expect(
      levenshtein(
        'Institut Européen des Membranes, Centre National de la Recherche Scientifique, 1919, Route de Mende, 34293 Montpellier Cedex 5, France',
        'IEM-CNRS, 1919, route de Mende, 34293 Montpellier cedex 5, France',
      ),
    ).toBeGreaterThan(10);

    expect(
      levenshtein(
        'Normandie Univ UNIHAVRE FR 3038 CNRS URCOM 76600 Le Havre France',
        'Normandie Univ, UNILEHAVRE, FR 3038 CNRS, URCOM, 76600 Le Havre, France',
      ),
    ).toBeGreaterThan(5);

    expect(
      levenshtein(
        'URCOM, Université du Havre, 25 rue Philippe Lebon, BP 540, 76058 Le Havre cedex, France.',
        'URCOM Université du Havre  EA 3221 FR CNRS 3038 25 rue Philippe Lebon B.P. 540 76058 Le Havre Cedex France',
      ),
    ).toBeGreaterThan(10);
  });
});

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

describe('normalizeString', () => {
  it('supprime les diacritiques et met en minuscules', () => {
    expect(normalizeString('École')).toBe('ecole');
  });

  it('remplace la ponctuation par des espaces et collapse les espaces', () => {
    expect(
      normalizeString('Normandie Univ, UNILEHAVRE, FR 3038 CNRS, URCOM, 76600 Le Havre, France'),
    ).toBe('normandie univ unilehavre fr 3038 cnrs urcom 76600 le havre france');
  });

  it('gère les caractères spéciaux et retours à la ligne', () => {
    expect(normalizeString('URCOM - Unité de Recherche en Chimie\nOrganique')).toBe(
      'urcom unite de recherche en chimie organique',
    );
    // collapse whitespace and trim
    expect(normalizeString('  A   B  ')).toBe('a b');
    // keep numbers and letters
    expect(normalizeString('Room #42, Bldg. 7')).toBe('room 42 bldg 7');
    // remove diacritics on long strings
    expect(normalizeString('Université Le Havre Normandie, Équipe de Recherche')).toBe(
      'universite le havre normandie equipe de recherche',
    );
  });
});
