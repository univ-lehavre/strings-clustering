import { sparseToDense } from '../src/embeddings';
import { asToken } from '../src/types';

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
