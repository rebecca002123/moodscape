// A tiny on-device sentiment reader. It never sends words anywhere —
// it simply listens for emotional tone so the island can respond.

const POSITIVE = [
  'happy', 'joy', 'grateful', 'gratitude', 'love', 'loved', 'loving', 'calm',
  'peaceful', 'peace', 'excited', 'amazing', 'wonderful', 'beautiful', 'hope',
  'hopeful', 'proud', 'win', 'won', 'smile', 'smiled', 'laugh', 'fun',
  'great', 'good', 'better', 'best', 'free', 'dream', 'inspired', 'light',
  'warm', 'sunshine', 'sunny', 'thankful', 'blessed', 'alive', 'energy',
  'confident', 'brave', 'kind', 'gift', 'celebrate', 'magic', 'safe',
];

const NEGATIVE = [
  'sad', 'cry', 'cried', 'crying', 'tears', 'lonely', 'alone', 'tired',
  'exhausted', 'anxious', 'anxiety', 'worried', 'worry', 'stress', 'stressed',
  'angry', 'mad', 'furious', 'hurt', 'pain', 'painful', 'afraid', 'fear',
  'scared', 'lost', 'empty', 'numb', 'heavy', 'dark', 'worst', 'bad',
  'terrible', 'awful', 'hate', 'miss', 'missing', 'grief', 'broken',
  'overwhelmed', 'stuck', 'fail', 'failed', 'failure', 'sick', 'storm',
];

const STOP = new Set([
  'about', 'after', 'again', 'because', 'before', 'being', 'could', 'every',
  'felt', 'feel', 'feeling', 'from', 'have', 'just', 'like', 'more',
  'much', 'really', 'some', 'that', 'their', 'them', 'then', 'there',
  'they', 'this', 'today', 'very', 'was', 'were', 'what', 'when', 'with',
  'would', 'yesterday', 'your', 'myself', 'into', 'over', 'such', 'than',
]);

export function analyzeSentiment(text) {
  if (!text || !text.trim()) return { score: 0, tone: 'neutral', keywords: [] };
  const words = text.toLowerCase().replace(/[^a-z'\s]/g, ' ').split(/\s+/).filter(Boolean);
  let pos = 0, neg = 0;
  const freq = {};
  for (const w of words) {
    if (POSITIVE.includes(w)) pos++;
    if (NEGATIVE.includes(w)) neg++;
    if (w.length > 4 && !STOP.has(w)) freq[w] = (freq[w] || 0) + 1;
  }
  const total = pos + neg;
  const raw = total === 0 ? 0 : (pos - neg) / total;
  const score = Math.max(-1, Math.min(1, raw));
  const keywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([w]) => w);
  const tone = score > 0.2 ? 'light' : score < -0.2 ? 'heavy' : 'tender';
  return { score, tone, keywords };
}
