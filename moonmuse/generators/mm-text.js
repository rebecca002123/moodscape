// Text content for MoonMuse journal & affirmation cards.
// 12 themes -> 365 prompts, 365 affirmations.

const THEMES = [
  { name: 'Beginnings', noun: 'a beginning', adj: 'new', phase: 0.05 },
  { name: 'Attention', noun: 'attention', adj: 'present', phase: 0.12 },
  { name: 'Rest', noun: 'rest', adj: 'rested', phase: 0.2 },
  { name: 'Growth', noun: 'growth', adj: 'growing', phase: 0.3 },
  { name: 'Courage', noun: 'courage', adj: 'brave', phase: 0.38 },
  { name: 'Joy', noun: 'joy', adj: 'glad', phase: 0.5 },
  { name: 'Stillness', noun: 'stillness', adj: 'still', phase: 0.56 },
  { name: 'Connection', noun: 'connection', adj: 'close', phase: 0.63 },
  { name: 'Release', noun: 'letting go', adj: 'lighter', phase: 0.7 },
  { name: 'Gratitude', noun: 'gratitude', adj: 'thankful', phase: 0.78 },
  { name: 'Depth', noun: 'depth', adj: 'honest', phase: 0.88 },
  { name: 'Renewal', noun: 'renewal', adj: 'renewed', phase: 0.97 },
];

// Hand-written prompts per theme (12 each)
const CORE = {
  Beginnings: [
    'Write about the last first time you can remember. What did your hands do?',
    'If this month were page one, what would the opening sentence be?',
    'Describe a door you have been standing in front of. What is on the other side?',
    'What did you begin once and abandon — and what would you tell that version of you?',
    'Draw or describe your life as a sky at dawn. What is rising first?',
    'What tiny thing could you start tonight that takes less than four minutes?',
    'Who do you know who begins things beautifully? What do they do first?',
    'Write the to-do list of your first week in a life you actually want.',
    'What would you attempt if nobody would ever review it?',
    'Which habit deserves a clean restart, without the guilt attached?',
    'Describe the feeling right before something starts — a show, a journey, a year.',
    'What are you a beginner at right now? Praise yourself for exactly that.',
  ],
  Attention: [
    'Describe your morning as if you had never lived one before.',
    'What did you almost not notice today?',
    'Sit for two minutes, then write only what you can hear.',
    'Who in your life is quietly asking to be noticed?',
    'What does your phone steal from? Name the specific hours.',
    'Describe the light in the room you are in, in ridiculous detail.',
    'What conversation this week deserved more of you than it got?',
    'Write about something ordinary — a spoon, a bus stop — until it becomes strange.',
    'Where does your mind go when it escapes? Follow it on paper.',
    'What would you see if you looked at your week like a stranger would?',
    'List ten things within arm’s reach. Circle the one with a story.',
    'What is asking for your attention that you keep scheduling for later?',
  ],
  Rest: [
    'What does rest actually look like for you — not what it is supposed to look like?',
    'Describe the most rested you have ever felt. Where were you?',
    'What are you tired of pretending not to be tired of?',
    'Write a permission slip for the nap, the no, or the early night.',
    'Which obligation could you set down for one week without the sky falling?',
    'What did rest look like in your childhood home? What did it teach you?',
    'Plan a perfect slow evening in exact, minute-by-minute detail.',
    'When you cannot sleep, where does your mind pace? Write the corridor.',
    'What would you do with a completely empty Saturday? Now — what stops you?',
    'Describe your bed as if selling it to an exhausted traveller.',
    'What noise could you turn off — literal or otherwise?',
    'Write down everything you are carrying. Underline what was never yours.',
  ],
  Growth: [
    'What can you do now that you could not do a year ago tonight?',
    'Write about a mistake that turned out to be a curriculum.',
    'What is growing in you right now that needs protecting, not pushing?',
    'Which of your edges is softening? Which is sharpening?',
    'Describe yourself at 80, in a good mood, giving you advice about this month.',
    'What feedback stung because it was true?',
    'What season is your life in — sowing, tending, harvest, or fallow? Argue for it.',
    'Write the syllabus for the class life is currently teaching you.',
    'What small skill would compound if you gave it ten minutes a day?',
    'Where are you still using a map of a country that has changed?',
    'What are you outgrowing — a habit, a story, a shell?',
    'Describe a plant you have known. What did it need that you also need?',
  ],
  Courage: [
    'What would you do this month if you were 10% braver?',
    'Write about a time your voice shook and you spoke anyway.',
    'Which honest sentence have you been swallowing? Write it here first.',
    'What is the kindest risk you could take this week?',
    'Describe the fear politely, like a guest. What does it want to protect?',
    'Who showed you courage without ever calling it that?',
    'What no do you owe someone? What yes do you owe yourself?',
    'Write the message you would send if outcomes were guaranteed kind.',
    'When did you last do something before you felt ready? What happened?',
    'What would your bravest friend do in your current situation?',
    'Which small daily cowardice costs the most by December?',
    'Finish this: If I knew it would work out in five years, tonight I would…',
  ],
  Joy: [
    'List the last ten things that made you laugh. Any patterns?',
    'Describe a perfect ordinary day — no lottery wins allowed.',
    'What did you love at nine years old that you still secretly love?',
    'Where does joy hide in your week, waiting for you to stop rushing?',
    'Write about a food, slowly. Make it a love letter.',
    'What song lifts you every single time? Play it, then write what moved.',
    'Whose happiness is contagious to you? Describe catching it.',
    'What would you do for fun if fun did not have to be productive?',
    'Describe the best light of the day, wherever you were.',
    'What tiny luxury is absolutely worth it? Defend it to a stern committee.',
    'Recall a moment you wish you could bottle. Open the bottle here.',
    'What made this week gentler than it might have been?',
  ],
  Stillness: [
    'Sit until the room settles. What settles last?',
    'Describe silence in your home at night. Is it friendly?',
    'What are you like when nothing is required of you?',
    'Write about water you have watched — a sea, a kettle, rain on glass.',
    'Which thought keeps circling? Let it land and look at it.',
    'What would a monastery of your own design be like?',
    'When did time last go slow in a good way?',
    'Describe your breath right now as weather.',
    'What do you hear at the very edge of hearing?',
    'Where could you build one still corner into your day?',
    'What does your body do when it finally believes it is safe?',
    'Write one page with no goal at all. See what surfaces.',
  ],
  Connection: [
    'Who knew you before you were this you? What do they protect?',
    'Write about a hand you have held.',
    'Which friendship is running on old fuel? What would refill it?',
    'What do you wish someone would ask you? Answer it here.',
    'Describe a stranger you still think about.',
    'What is your love language when nobody is translating?',
    'Write the thank-you note you never sent.',
    'Who is easy to be quiet with? What makes the quiet good?',
    'What belonging have you felt in a group, a place, or a night?',
    'Which relationship deserves a new ritual — a walk, a call, a recipe?',
    'What do people misunderstand about you? What is the truer sentence?',
    'Write about someone you miss, in the present tense.',
  ],
  Release: [
    'What are you gripping that has already ended?',
    'Write the eulogy for a habit you are ready to bury.',
    'Which apology are you still waiting for? What if it never comes?',
    'Empty your pockets on the page: every worry, one line each.',
    'What would you remove from your home first? Your calendar? Your mind?',
    'Describe a time you finally let go. What did your shoulders do?',
    'What story about yourself has expired? Write its last paragraph.',
    'Which tab — literal or mental — has been open too long?',
    'Forgiveness aside, what would mere ceasefire look like?',
    'What did you inherit that you do not have to keep?',
    'Write a goodbye letter to this month, thanking it and closing the door.',
    'If you travelled with one small bag, what makes the cut?',
  ],
  Gratitude: [
    'Thank something that cannot hear you — a kettle, a bridge, a coat.',
    'Who made today easier without knowing it?',
    'Write about a comfort you only notice when it is missing.',
    'What did past-you set up that present-you is enjoying?',
    'List five textures you are glad exist.',
    'What difficulty are you — carefully, honestly — grateful for?',
    'Describe a meal someone made you. Include their hands.',
    'What in your body quietly works, day after day, unthanked?',
    'Which book, song or film arrived exactly when you needed it?',
    'Thank a teacher. Then find the sentence of theirs you still use.',
    'What made you feel rich this week that cost nothing?',
    'Write tomorrow’s gratitude list tonight, in faith.',
  ],
  Depth: [
    'What question are you living inside right now?',
    'Write about the thing you think about when you cannot sleep, without solving it.',
    'What truth do you keep at arm’s length because it would reorganise things?',
    'Describe your inner weather this season, fronts and all.',
    'What did you believe five years ago that you have quietly revised?',
    'Which value would you not trade even for ease?',
    'What does your envy point at? Follow the arrow.',
    'Write about death for one page, gently, like an adult.',
    'What is the difference between who you are and who you perform?',
    'What would you write if you knew no one would ever read it? Begin.',
    'Which memory keeps returning uninvited? Ask it what it wants.',
    'What do you know for sure? Keep the list short and true.',
  ],
  Renewal: [
    'What is quietly repairing itself in you?',
    'Describe the last time you felt genuinely new — after rain, a haircut, a hard cry.',
    'What ritual returns you to yourself? When did you last perform it?',
    'Write about a place that resets you. Go there on paper.',
    'What would a fresh coat of paint look like on this season of life?',
    'Which ending this year was secretly a beginning wearing a coat?',
    'What are you ready to try again, differently?',
    'Describe yourself as a garden in early spring. What survived winter?',
    'What promise to yourself deserves a renewal, not a rewrite?',
    'What would this week look like with one honest sabbath in it?',
    'Write a welcome letter to the person you are becoming.',
    'The moon empties to fill again. What is your version of that?',
  ],
};

// Cross-theme stems (19) — {n}=noun, {a}=adj
const STEMS = [
  'Where did {n} show up in your body this week? Describe the exact location.',
  'Write about a person who taught you something true about {n}.',
  'What would tomorrow look like with ten percent more {n} in it?',
  'Describe a place that reliably gives you {n}. Use all five senses.',
  'What is the smallest act of {n} you could complete before sleep tonight?',
  'When did you last resist {n}? What were you protecting?',
  'Write a letter from a day when you felt completely {a}.',
  'What does {n} look like at 7am? At 11pm? Which is truer?',
  'List five small proofs that {n} is already present in your life.',
  'What would you stop doing if you trusted {n} more?',
  'Describe {n} as weather arriving over your week.',
  'What almost gave you {n} today but got interrupted? Finish it on paper.',
  'Write the advice about {n} you give others but rarely take.',
  'How did your family treat {n}? What did you keep, and what did you leave?',
  'If {n} were a room in your home, describe it. What needs opening?',
  'What are you willing to trade for more {n} — and what are you not?',
  'Write a two-line poem about {n}. Then explain it to yourself kindly.',
  'What will you thank this month for teaching you about {n}?',
  'Ask yourself one brave question about {n}, and answer it slowly.',
];

function buildPrompts() {
  // 365 prompts: for each of 12 themes take 12 core + stems to fill ~30-31
  const perMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 365
  const months = [];
  THEMES.forEach((t, i) => {
    const need = perMonth[i];
    const list = [...CORE[t.name]];
    let s = 0;
    while (list.length < need) {
      list.push(STEMS[(s + i) % STEMS.length].replace(/\{n\}/g, t.noun).replace(/\{a\}/g, t.adj));
      s++;
    }
    months.push({ theme: t, prompts: list.slice(0, need) });
  });
  return months;
}

// Affirmation patterns — {n} noun, {a} adj; hand-written 8 per theme + patterns
const AFF_CORE = {
  Beginnings: ['Every dawn negotiates with the dark, and wins.', 'I am allowed to start small and start now.', 'Page one does not need to know the ending.', 'I begin before I feel ready, and readiness follows.', 'New is not a risk; staying finished is.', 'My first steps count double.', 'Today is an unused sky.', 'I open doors gently, and I open them.'],
  Attention: ['Where my attention goes, my life quietly follows.', 'I am here, and here is enough to study.', 'I notice the small things; the small things are the things.', 'My presence is the gift; the rest is wrapping.', 'One moment, fully attended, outweighs a scattered day.', 'I look twice at ordinary things.', 'The light in this room is worth my eyes.', 'I give my hours names instead of losing them.'],
  Rest: ['Rest is not a reward; it is a right.', 'I can be loved and horizontal at the same time.', 'The moon rests in shadow and loses nothing.', 'My worth does not clock in.', 'Tonight I put the day down whole.', 'Slowness is a speed I am allowed.', 'I answer tiredness with kindness, not caffeine.', 'Even tides go out twice a day.'],
  Growth: ['I am not behind; I am in an earlier chapter.', 'Everything I survive becomes soil.', 'I grow at the pace of roots, not headlines.', 'Small daily light is how forests happen.', 'I let my edges soften and my spine stay.', 'I am under construction and open for business.', 'What stung me taught me.', 'A year from tonight, this was the turning.'],
  Courage: ['My voice can shake and still be true.', 'I do brave quietly.', 'Fear is a compass pointing at what matters.', 'I would rather be honest than comfortable.', 'The kind risk is still a risk; I take it kindly.', 'I say the true sentence first to myself, then aloud.', 'Courage is a muscle; today is a repetition.', 'I am the ancestor of my own bravery.'],
  Joy: ['Joy is not frivolous; it is fuel.', 'I let good things be good without auditing them.', 'Delight is a discipline I practise.', 'I laugh easily and it costs the world nothing.', 'Ordinary days are where the treasure is buried.', 'I am allowed pleasures that produce nothing.', 'My happiness is not a queue-jump; it is a lantern.', 'Today I will catch at least one small marvel.'],
  Stillness: ['I can be still and not be stuck.', 'Quiet is where my answers change their clothes.', 'I am the calm after my own storm.', 'Stillness is not empty; it is full of me.', 'I breathe out longer than I breathe in.', 'The night does not rush, and it finishes everything.', 'I sit with myself like good company.', 'My silence is a room, not a wall.'],
  Connection: ['I am easy to love when I let myself be seen.', 'I water the friendships I want to keep.', 'Being known is worth the unlocking.', 'I reach out first and it makes me strong, not needy.', 'The people who matter can have my unpolished self.', 'I belong in every room I enter honestly.', 'Love, in my house, is a verb with a schedule.', 'I am somebody’s good news.'],
  Release: ['I put down what has already put me down.', 'Letting go is something I do with both hands open.', 'Not every inheritance must be kept.', 'I forgive, mostly so my hands are free.', 'The moon empties without panic.', 'I close tabs, doors and chapters with grace.', 'What leaves makes room.', 'I travel lighter every season.'],
  Gratitude: ['Thankfulness is my resting position.', 'I count lights, not lacks.', 'Something worked hard for every easy thing I have.', 'My body keeps a thousand quiet promises a day.', 'I say thank you like I mean it, because I do.', 'Enough is a feast when I notice it.', 'Past me left gifts everywhere; today I open one.', 'Gratitude turns what I have into plenty.'],
  Depth: ['I can hold a question without rushing the answer.', 'My depths are not a danger; they are a resource.', 'I tell myself the truth in a gentle voice.', 'What I feel makes sense given what I have lived.', 'I am more than the sum of my performances.', 'Honest is my favourite kind of beautiful.', 'I visit my shadows with a lantern, not a whip.', 'The deep end is where I learned to swim.'],
  Renewal: ['I am allowed to begin again, without penalty.', 'Repair is quietly happening in me right now.', 'Every ending pays forward a beginning.', 'I return to myself like a tide.', 'Winter did not kill the garden; it scheduled it.', 'I renew my promises instead of multiplying them.', 'Today is a soft reset, taken gratefully.', 'Like the moon, I am never actually gone.'],
};
const AFF_PATTERNS = [
  'I choose {n} over hurry today.',
  'There is room in my life for more {n}.',
  'I am learning {n} at my own pace.',
  '{a}, unhurried, and on my way — that is enough.',
  'I trust the slow work of {n}.',
  'My {n} does not need an audience.',
  'Tonight I end the day {a}.',
  'I make space for {n} the way the sky makes space for stars.',
  'Small acts of {n} are still acts of {n}.',
  'I am becoming someone who defaults to {n}.',
  'Even on grey days, my {n} holds.',
  'I greet this morning {a} and curious.',
  'The moon keeps its phases; I keep my {n}.',
  'I protect one hour a day for {n}.',
  'My future self is thanking me for today’s {n}.',
  'I speak to myself in the language of {n}.',
  'Nothing urgent outranks my {n}.',
  'I carry {n} the way night carries stars — lightly.',
  'Where I go, {n} is welcome to follow.',
  'I finish this week more {a} than I began it.',
  'One breath of {n} changes the whole room.',
  'I let {n} be simple today.',
  'I am proof that {n} is possible on ordinary days.',
];

function buildAffirmations() {
  const perMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const months = [];
  THEMES.forEach((t, i) => {
    const need = perMonth[i];
    const list = [...AFF_CORE[t.name]];
    let s = 0;
    while (list.length < need) {
      list.push(AFF_PATTERNS[(s * 5 + i) % AFF_PATTERNS.length].replace(/\{n\}/g, t.noun).replace(/\{a\}/g, t.adj.charAt(0).toUpperCase() === t.adj.charAt(0) ? t.adj : t.adj));
      s++;
    }
    months.push({ theme: t, items: list.slice(0, need) });
  });
  return months;
}

module.exports = { THEMES, buildPrompts, buildAffirmations };
