import { asToken } from '../src/types';
import {
  tokensCorpus,
  tfCorpus,
  vocabulary,
  idf,
  tfidfCorpus,
  softmaxTfidf,
  sparseToDense,
  asFrequency,
} from '../src';

describe('embeddings', () => {
  it('tokensCorpus génère les bons ngrams', () => {
    const corpus = ['abc', 'bcd'];
    const toks = tokensCorpus(corpus, { minN: 2, maxN: 2 });
    expect(toks.length).toBe(2);
    expect(toks[0].map(t => t as string)).toEqual(['ab', 'bc']);
    expect(toks[1].map(t => t as string)).toEqual(['bc', 'cd']);
  });

  it('tfCorpus calcule les fréquences', () => {
    const toks = [[asToken('a'), asToken('b'), asToken('a')]];
    const tf = tfCorpus(toks);
    expect(tf[0].get(asToken('a'))).toBeCloseTo(2 / 3);
    expect(tf[0].get(asToken('b'))).toBeCloseTo(1 / 3);
  });

  it('vocabulary extrait tous les tokens uniques', () => {
    const tf = [
      new Map([
        [asToken('a'), asFrequency(1)],
        [asToken('b'), asFrequency(2)],
      ]),
    ];
    const vocab = vocabulary(tf);
    expect(vocab.map(t => t as string)).toEqual(expect.arrayContaining(['a', 'b']));
  });

  it('idf calcule les bons scores', () => {
    const tf = [
      new Map([[asToken('a'), asFrequency(1)]]),
      new Map([
        [asToken('a'), asFrequency(1)],
        [asToken('b'), asFrequency(1)],
      ]),
    ];
    const vocab = [asToken('a'), asToken('b')];
    const idfMap = idf(tf, vocab);
    expect(idfMap.get(asToken('a'))).toBeGreaterThan(0);
    expect(idfMap.get(asToken('b'))).toBeGreaterThan(0);
  });

  it('tfidfCorpus combine tf et idf', () => {
    const tf = [new Map([[asToken('a'), asFrequency(1)]])];
    const vocab = [asToken('a')];
    const tfidf = tfidfCorpus(tf, vocab);
    expect(tfidf.length).toBe(1);
    expect(tfidf[0].get(asToken('a'))).toBeGreaterThan(0);
  });

  it('softmaxTfidf normalise en probabilités', () => {
    const doc = new Map([
      [asToken('a'), 1],
      [asToken('b'), 2],
    ]);
    const result = softmaxTfidf([doc])[0];
    const sum = Array.from(result.values()).reduce((acc, v) => acc + v, 0);
    expect(sum).toBeCloseTo(1);
  });

  it('sparseToDense convertit correctement', () => {
    const vocab = [asToken('a'), asToken('b')];
    const docs = [new Map([[asToken('a'), 1]])];
    const dense = sparseToDense(docs, vocab);
    expect(dense).toEqual([[1, 0]]);
  });
});

describe('sparseToDense', () => {
  it('convertit un document sparse simple en dense', () => {
    const vocab = [asToken('a'), asToken('b'), asToken('c')];
    const docs = [
      new Map([
        [asToken('a'), 1],
        [asToken('c'), 2],
      ]),
    ];
    const result = sparseToDense(docs, vocab);
    expect(result).toEqual([[1, 0, 2]]);
  });

  it('gère plusieurs documents', () => {
    const vocab = [asToken('x'), asToken('y')];
    const docs = [new Map([[asToken('x'), 3]]), new Map([[asToken('y'), 4]])];
    const result = sparseToDense(docs, vocab);
    expect(result).toEqual([
      [3, 0],
      [0, 4],
    ]);
  });

  it('remplit de zéros les tokens absents', () => {
    const vocab = [asToken('a'), asToken('b')];
    const docs = [new Map([[asToken('a'), 5]]), new Map()];
    const result = sparseToDense(docs, vocab);
    expect(result).toEqual([
      [5, 0],
      [0, 0],
    ]);
  });

  it('gère un vocabulaire vide', () => {
    const vocab: ReturnType<typeof asToken>[] = [];
    const docs = [new Map([[asToken('a'), 1]])];
    const result = sparseToDense(docs, vocab);
    expect(result).toEqual([[]]);
  });

  it('gère des documents vides', () => {
    const vocab = [asToken('a'), asToken('b')];
    const docs: Map<ReturnType<typeof asToken>, number>[] = [];
    const result = sparseToDense(docs, vocab);
    expect(result).toEqual([]);
  });
});

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
