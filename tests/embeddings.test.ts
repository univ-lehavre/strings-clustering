import { fitNgramVocabulary, textToTfVector } from '../src/embeddings';

describe('fitNgramVocabulary', () => {
  it('construit un vocabulaire basique pour n=3', () => {
    const docs = ['abcde', 'abxyz'];
    const vocab = fitNgramVocabulary(docs, { n: 3, minCount: 1 });
    // doit contenir quelques 3-grams attendus
    expect(vocab).toEqual(expect.arrayContaining(['abc', 'bcd', 'cde', 'abx', 'bxy', 'xyz']));
    expect(vocab.length).toBeGreaterThanOrEqual(6);
  });

  it('filtre les tokens par minCount', () => {
    const docs = ['aaaa', 'aaaa', 'bbbb'];
    // avec n=2, 'aa' apparaîtra plusieurs fois
    const vocabAll = fitNgramVocabulary(docs, { n: 2, minCount: 1 });
    expect(vocabAll).toContain('aa');
    expect(vocabAll).toContain('bb');

    // 'bb' apparaît moins souvent que 'aa' ici; on choisit minCount=4 pour filtrer 'bb'
    const vocabFiltered = fitNgramVocabulary(docs, { n: 2, minCount: 4 });
    expect(vocabFiltered).toContain('aa');
    expect(vocabFiltered).not.toContain('bb');
  });

  it('supporte n=1 (caractères)', () => {
    const docs = ['ab', 'bc'];
    const vocab = fitNgramVocabulary(docs, { n: 1, minCount: 1 });
    expect(vocab).toEqual(expect.arrayContaining(['a', 'b', 'c']));
  });

  it('respecte preserveWhitespace quand demandé', () => {
    const docs = ['a b', 'a b'];
    const vocab = fitNgramVocabulary(docs, {
      n: 2,
      minCount: 1,
      ngramOpts: { normalize: true, preserveWhitespace: true },
    });
    // avec preserveWhitespace les tokens contenant un espace doivent exister
    expect(vocab.some(t => t.includes(' '))).toBeTruthy();
  });
});
