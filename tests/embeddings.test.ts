import { Brand } from 'effect';
import {
  fitNgramVocabulary,
  textToTfVector,
  embedText,
  embedCorpus,
  cosine,
} from '../src/embeddings';
import type { Corpus } from '../src/types';

const Corpus = Brand.nominal<Corpus>();

describe('fitNgramVocabulary', () => {
  it('construit un vocabulaire basique pour n=3', () => {
    const docs = ['abcde', 'abxyz'];
    const vocab = fitNgramVocabulary(Corpus(docs), { n: 3, minCount: 1 });
    // doit contenir quelques 3-grams attendus
    expect(vocab).toEqual(expect.arrayContaining(['abc', 'bcd', 'cde', 'abx', 'bxy', 'xyz']));
    expect(vocab.length).toBeGreaterThanOrEqual(6);
  });

  it('filtre les tokens par minCount', () => {
    const docs = ['aaaa', 'aaaa', 'bbbb'];
    // avec n=2, 'aa' apparaîtra plusieurs fois
    const vocabAll = fitNgramVocabulary(Corpus(docs), { n: 2, minCount: 1 });
    expect(vocabAll).toContain('aa');
    expect(vocabAll).toContain('bb');

    // 'bb' apparaît moins souvent que 'aa' ici; on choisit minCount=4 pour filtrer 'bb'
    const vocabFiltered = fitNgramVocabulary(Corpus(docs), { n: 2, minCount: 4 });
    expect(vocabFiltered).toContain('aa');
    expect(vocabFiltered).not.toContain('bb');
  });

  it('supporte n=1 (caractères)', () => {
    const docs = ['ab', 'bc'];
    const vocab = fitNgramVocabulary(Corpus(docs), { n: 1, minCount: 1 });
    expect(vocab).toEqual(expect.arrayContaining(['a', 'b', 'c']));
  });

  it('respecte preserveWhitespace quand demandé', () => {
    const docs = ['a b', 'a b'];
    const vocab = fitNgramVocabulary(Corpus(docs), {
      n: 2,
      minCount: 1,
      ngramOpts: { normalize: true, preserveWhitespace: true },
    });
    // avec preserveWhitespace les tokens contenant un espace doivent exister
    expect(vocab.some(t => t.includes(' '))).toBeTruthy();
  });
});

describe('embedCorpus', () => {
  it("retourne autant de vecteurs que de documents et préserve l'ordre", () => {
    const vocab = ['abc', 'bcd', 'cde'];
    const texts = ['abcde', 'xabcx', ''];
    const embs = embedCorpus(texts, vocab, { n: 3 });
    expect(embs.length).toBe(texts.length);
    // chaque embedding doit correspondre à embedText pour le même texte
    for (let i = 0; i < texts.length; i++) {
      expect(embs[i]).toEqual(
        embedText(texts[i], vocab, { n: 3 } as unknown as Parameters<typeof embedText>[2]),
      );
    }
  });

  it('gère un corpus vide (retourne un tableau vide)', () => {
    const vocab: string[] = ['a', 'b'];
    const embs = embedCorpus([], vocab, { n: 1 });
    expect(Array.isArray(embs)).toBeTruthy();
    expect(embs.length).toBe(0);
  });

  it('normalise chaque vecteur en L2', () => {
    const vocab = ['ab', 'bc', 'cd'];
    const texts = ['abcd', 'bcda'];
    const embs = embedCorpus(texts, vocab, { n: 2 });
    for (const v of embs) {
      const sumsq = v.reduce((s, x) => s + x * x, 0);
      if (sumsq !== 0) expect(Math.abs(sumsq - 1)).toBeLessThan(1e-6);
    }
  });
});

describe('textToTfVector', () => {
  it('produit un vecteur de la taille du vocabulaire', () => {
    const vocab = ['abc', 'bcd', 'cde', 'def'];
    const vec = textToTfVector('abcdef', vocab, 3);
    expect(vec.length).toBe(vocab.length);
    // au moins un token devrait être présent dans le texte
    expect(vec.some(v => v > 0)).toBeTruthy();
  });

  it('normalise en L2 (norme 1) sauf vecteur nul', () => {
    const vocab = ['abc', 'bcd', 'cde'];
    const vec = textToTfVector('abcde', vocab, 3);
    const sumsq = vec.reduce((s, v) => s + v * v, 0);
    expect(Math.abs(sumsq - 1)).toBeLessThan(1e-6);

    const empty = textToTfVector('', vocab, 3);
    expect(empty.every(x => x === 0)).toBeTruthy();
  });

  it('les indices correspondent aux tokens du vocabulaire', () => {
    // Vocabulaire explicite pour vérifier les indices de façon claire
    const vocab = ['abc', 'bcd', 'cde'];
    const vec = textToTfVector('abcde', vocab, 3);
    // 'abc' est à l'index 0
    expect(vec[0]).toBeGreaterThan(0);
  });
});

describe('embedText', () => {
  it('équivaut à textToTfVector pour des options explicites', () => {
    const vocab = ['abc', 'bcd', 'cde'];
    const text = 'abcde';
    const a = textToTfVector(text, vocab, 3);
    const b = embedText(text, vocab, { n: 3 });
    expect(b).toEqual(a);
  });

  it('respecte les ngramOpts (preserveWhitespace)', () => {
    const vocab = ['a ', ' b'];
    const v = embedText('a b', vocab, {
      n: 2,
      ngramOpts: { normalize: true, preserveWhitespace: true },
    });
    expect(v.some(x => x > 0)).toBeTruthy();
  });

  it('renvoie un vecteur nul pour un texte vide', () => {
    const vocab = ['abc', 'bcd'];
    const v = embedText('', vocab, { n: 3 });
    expect(v.every(x => x === 0)).toBeTruthy();
  });

  it('utilise n=3 par défaut si non fourni dans opts', () => {
    const vocab = ['abc', 'bcd', 'cde', 'def'];
    // cast sûr sans utiliser `any`
    const v1 = embedText('abcdef', vocab, {} as unknown as Parameters<typeof embedText>[2]);
    const v2 = textToTfVector('abcdef', vocab, 3);
    expect(v1).toEqual(v2);
  });
});

describe('cosine - cas unitaires complets', () => {
  it('1 pour deux vecteurs identiques (petit)', () => {
    const a = [1, 2, 3];
    expect(cosine(a, a)).toBeCloseTo(1);
  });

  it('-1 impossible avec vecteurs non centrés (mais teste la gestion des signes)', () => {
    const a = [1, 0];
    const b = [-1, 0];
    // produit négatif complet => -1 attendu
    expect(cosine(a, b)).toBeCloseTo(-1);
  });

  it('0 pour vecteurs orthogonaux', () => {
    const a = [1, 0, 0];
    const b = [0, 1, 0];
    expect(cosine(a, b)).toBeCloseTo(0);
  });

  it('prise en charge de vecteurs de longueurs différentes (utilise la longueur min)', () => {
    const a = [1, 2, 0];
    const b = [1, 2];
    // équivalent de cos(a.slice(0,2), b)
    const expected = (1 * 1 + 2 * 2) / (Math.sqrt(1 * 1 + 2 * 2) * Math.sqrt(1 * 1 + 2 * 2));
    expect(cosine(a, b)).toBeCloseTo(expected);
  });

  it('renvoie 0 si l un des vecteurs est nul', () => {
    const a = [0, 0, 0];
    const b = [1, 2, 3];
    expect(cosine(a, b)).toBe(0);
    expect(cosine(b, a)).toBe(0);
  });

  it('gère valeurs flottantes et tolérance', () => {
    const a = [0.1, 0.2, 0.3];
    const b = [0.1, 0.2, 0.3];
    expect(cosine(a, b)).toBeCloseTo(1, 6);
  });

  it('cas extrêmes: vecteurs grands et petits', () => {
    const a = Array.from({ length: 100 }, (_, i) => i + 1);
    const b = [...a];
    expect(cosine(a, b)).toBeCloseTo(1);
  });
});
