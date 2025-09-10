import { normalizeString } from '../src/utils';

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
