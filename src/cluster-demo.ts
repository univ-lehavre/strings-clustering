import fs from 'fs';
import { fitNgramVocabulary, embedText, cosine } from './index';

const data = JSON.parse(fs.readFileSync('basic-usage.json', 'utf-8')) as string[];

// Build a small n-gram vocabulary from the corpus and embed first two items
const vocab = fitNgramVocabulary(data, { n: 3, minCount: 1 });
console.log('Vocab size:', vocab.length);

const v0 = embedText(data[0], vocab, { n: 3 });
const v1 = embedText(data[1], vocab, { n: 3 });
console.log('Cosine similarity entre item 0 et 1:', cosine(v0, v1).toFixed(4));
