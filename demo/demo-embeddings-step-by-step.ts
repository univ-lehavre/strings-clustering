import {
  fitNgramVocabulary,
  textToTfVector,
  embedText,
  embedCorpus,
  cosine,
} from '../src/embeddings.ts';

// Demo pas à pas pour les fonctions de src/embeddings.ts
// 1) fitNgramVocabulary
// 2) textToTfVector
// 3) embedText
// 4) embedCorpus
// 5) cosine

const corpus = [
  'Université Le Havre',
  'Univ Le Havre',
  'UNILEHAVRE France',
  'Institut Européen des Membranes',
  'IEM CNRS',
];

console.log('=== DEMO: embeddings pas à pas ===\n');

// --- Étape 1: construire un vocabulaire d'n-grams (n=3) ---
console.log('Étape 1: fitNgramVocabulary (n=3, minCount=1)');
const vocab = fitNgramVocabulary(corpus, { n: 3, minCount: 1 });
console.log('Vocab size:', vocab.length);
console.log('Quelques tokens du vocab (10 premiers):', vocab.slice(0, 10));

// Montrer comment changer minCount pour filtrer le vocabulaire
console.log('\nÉtape 1b: fitNgramVocabulary avec minCount=2 (filtrage des tokens rares)');
const vocabMin2 = fitNgramVocabulary(corpus, { n: 3, minCount: 2 });
console.log('Vocab size (minCount=2):', vocabMin2.length);
console.log('Tokens:', vocabMin2);

// --- Étape 2: textToTfVector ---
console.log("\nÉtape 2: textToTfVector (encodage d'un texte en vecteur TF normalisé L2)");
const sample = 'Université Le Havre';
const vec = textToTfVector(sample, vocab, 3);
console.log('Texte:', sample);
console.log('Vector length:', vec.length);
console.log(
  'Vector (premières 12 dimensions, arrondies):',
  vec.slice(0, 12).map(v => v.toFixed(3)),
);

// --- Étape 3: embedText (wrapper simple) ---
console.log('\nÉtape 3: embedText (utilise textToTfVector sous le capot)');
const embSample = embedText('Univ Le Havre', vocab, { n: 3 });
console.log(
  'Embedding (premières 8 dims):',
  embSample.slice(0, 8).map(v => v.toFixed(3)),
);

// --- Étape 4: embedCorpus ---
console.log('\nÉtape 4: embedCorpus (encoder tout le corpus)');
const embs = embedCorpus(corpus, vocab, { n: 3 });
console.log("Nombre d'embeddings:", embs.length);
console.log(
  'Extrait embedding[0] (8 dims):',
  embs[0].slice(0, 8).map(v => v.toFixed(3)),
);

// --- Étape 5: cosine similarity ---
console.log('\nÉtape 5: cosine (calcul des similarités entre embeddings)');
for (let i = 0; i < corpus.length; i++) {
  const row: string[] = [];
  for (let j = 0; j < corpus.length; j++) {
    row.push(cosine(embs[i], embs[j]).toFixed(3));
  }
  console.log(`sim[${i}]:`, row.join(' '));
}

// Recherche simple: pour une requête, trouver les 3 plus proches dans le corpus
console.log('\nRecherche simple: trouver les 3 plus proches pour la requête "Le Havre Université"');
const query = 'Le Havre Université';
const qEmb = embedText(query, vocab, { n: 3 });
const scores = embs.map((e, i) => ({ i, score: cosine(qEmb, e) }));
scores.sort((a, b) => b.score - a.score);
console.log('Top 3:');
console.log(
  scores
    .slice(0, 3)
    .map(s => `${s.i}:${corpus[s.i]} (${s.score.toFixed(3)})`)
    .join('\n'),
);

console.log('\n=== Fin DEMO embeddings ===');
