// SnapNest's wardrobe: cream mornings, pastel nests, one warm rose accent.
// Every screen dresses from here so the whole app feels like one soft place.

export const palette = {
  cream: '#FBF7F1',
  lavender: '#F3EFFA',
  card: '#FFFFFF',
  ink: '#463B55',
  inkSoft: 'rgba(70,59,85,0.58)',
  inkFaint: 'rgba(70,59,85,0.34)',
  line: 'rgba(70,59,85,0.10)',
  rose: '#E4577E',
  roseSoft: '#FFD9E6',
  sun: '#FFC94D',
  cloud: '#FFFFFF',
  sky: '#CDE4FF',
};

// The nine kinds of card a screenshot can become. Each type owns a pastel,
// a deep readable accent, and the name of the smart Nest it files into.
export const TYPES = {
  product: { label: 'Product', nest: 'Wishlist', emoji: '🛍️', bg: '#FFE4CF', deep: '#B85F22', verb: 'saved' },
  event: { label: 'Event', nest: 'Upcoming', emoji: '🎟️', bg: '#FFD9E6', deep: '#BD4377', verb: 'planned' },
  recipe: { label: 'Recipe', nest: 'Recipe box', emoji: '🍜', bg: '#FFF1C2', deep: '#9C7011', verb: 'kept' },
  job: { label: 'Job', nest: 'Job hunt', emoji: '💼', bg: '#D6E9FF', deep: '#3568AD', verb: 'spotted' },
  outfit: { label: 'Outfit', nest: 'Style board', emoji: '👗', bg: '#E9DFFF', deep: '#7150B8', verb: 'pinned' },
  place: { label: 'Place', nest: 'Saved places', emoji: '🏡', bg: '#D7F2E1', deep: '#27815A', verb: 'saved' },
  message: { label: 'Message', nest: 'Reply later', emoji: '💬', bg: '#FFE1DA', deep: '#B54E38', verb: 'flagged' },
  travel: { label: 'Trip', nest: 'Dream trips', emoji: '✈️', bg: '#D3F0F2', deep: '#28808A', verb: 'dreamed' },
  idea: { label: 'Idea', nest: 'Mood board', emoji: '✨', bg: '#F3E0F5', deep: '#96479E', verb: 'collected' },
};

export const TYPE_KEYS = Object.keys(TYPES);

// Onboarding interest bubbles → the card types they wake up on the home screen.
export const INTERESTS = [
  { key: 'shopping', label: 'Shopping', emoji: '🛍', types: ['product'] },
  { key: 'travel', label: 'Travel', emoji: '✈️', types: ['travel'] },
  { key: 'recipes', label: 'Recipes', emoji: '🍜', types: ['recipe'] },
  { key: 'jobs', label: 'Jobs', emoji: '💼', types: ['job'] },
  { key: 'outfits', label: 'Outfits', emoji: '👗', types: ['outfit'] },
  { key: 'events', label: 'Events', emoji: '🎟', types: ['event'] },
  { key: 'messages', label: 'Messages', emoji: '💬', types: ['message'] },
  { key: 'home', label: 'Home ideas', emoji: '🏡', types: ['place', 'idea'] },
];

export const radii = { big: 28, card: 22, chip: 16, pill: 999 };

// One soft shadow, used everywhere a card floats above the cream.
export const softShadow = {
  shadowColor: '#5B4A72',
  shadowOpacity: 0.10,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

export const type = {
  h1: { fontSize: 30, fontWeight: '800', color: palette.ink, letterSpacing: 0.2 },
  h2: { fontSize: 21, fontWeight: '800', color: palette.ink },
  h3: { fontSize: 16, fontWeight: '700', color: palette.ink },
  body: { fontSize: 15, color: palette.ink },
  soft: { fontSize: 14, color: palette.inkSoft },
  tiny: { fontSize: 12, color: palette.inkSoft },
};
