import { calculateWordSimilarity } from '../utils/text-similarity';

const testPairs = [
  ['look at', 'looked at'],
  ['look at', 'look at'],
  ['run', 'running'],
  ['cat', 'cats'],
  ['color', 'colour'],
  ['listen', 'listening'],
  ['take off', 'took off'],
  ['apple', 'banana'],
  ['get up', 'wake up'],
  ['give up', 'gave up'],
];

console.log('--- TEST WORD SIMILARITY ---');
for (const [w1, w2] of testPairs) {
  const score = calculateWordSimilarity(w1, w2);
  console.log(`"${w1}" vs "${w2}": ${score}% (>= 80%: ${score >= 80 ? 'DUPLICATE' : 'NEW'})`);
}
