import { levenshtein } from '../src/utils';

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
