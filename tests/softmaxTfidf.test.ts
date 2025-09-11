import { softmaxTfidf } from '../src/embeddings';
import { asToken } from '../src/types';

describe('softmaxTfidf', () => {
  it('normalise un document TF-IDF simple', () => {
    const doc = new Map([
      [asToken('a'), 1],
      [asToken('b'), 2],
      [asToken('c'), 3],
    ]);
    const result = softmaxTfidf([doc])[0];
    const values = Array.from(result.values());
    const sum = values.reduce((acc, v) => acc + v, 0);
    expect(sum).toBeCloseTo(1, 6);
    // Vérifie que la plus grande valeur correspond au plus grand score
    const maxToken = [...result.entries()].reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    expect(maxToken as string).toBe('c');
  });

  it('gère les valeurs négatives', () => {
    const doc = new Map([
      [asToken('x'), -1],
      [asToken('y'), -2],
      [asToken('z'), -3],
    ]);
    const result = softmaxTfidf([doc])[0];
    const values = Array.from(result.values());
    const sum = values.reduce((acc, v) => acc + v, 0);
    expect(sum).toBeCloseTo(1, 6);
    const maxToken = [...result.entries()].reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    expect(maxToken as string).toBe('x');
  });

  it('retourne un document vide si la map est vide', () => {
    const doc = new Map();
    const result = softmaxTfidf([doc])[0];
    expect(result.size).toBe(0);
  });

  it('normalise plusieurs documents', () => {
    const docs = [
      new Map([
        [asToken('a'), 0],
        [asToken('b'), 0],
      ]),
      new Map([
        [asToken('x'), 10],
        [asToken('y'), 0],
      ]),
    ];
    const results = softmaxTfidf(docs);
    expect(results.length).toBe(2);
    expect(Array.from(results[0].values()).reduce((acc, v) => acc + v, 0)).toBeCloseTo(1, 6);
    expect(Array.from(results[1].values()).reduce((acc, v) => acc + v, 0)).toBeCloseTo(1, 6);
    // Le token 'x' doit dominer dans le second doc
    const maxToken = [...results[1].entries()].reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    expect(maxToken as string).toBe('x');
  });
});
