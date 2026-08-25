/**
 * Quiz logic — single source of truth (§8).
 *
 * The 2-minute qualification quiz is shared by /qualify and the home page; the
 * legacy site had two copies of the arithmetic. This module is that arithmetic,
 * extracted once so both surfaces render identical numbers (and so the §13.2
 * 432-case parity test can pin it).
 *
 * Pure: no DOM, no React. Safe to import from a server component, a client
 * component, or a Node test.
 */

export type AnswerKey = 'gap' | 'hours' | 'process' | 'judgment' | 'timing';

/** The answers object a completed quiz produces. */
export interface Answers {
  gap: string;
  hours: string;
  process: string;
  judgment: string;
  timing: string;
}

export interface QuizOption {
  value: string;
  label: string;
  note: string;
}

export interface QuizQuestion {
  id: AnswerKey;
  q: string;
  help: string;
  fyi: string;
  options: QuizOption[];
}

/** The computed estimate shown in the result. */
export interface QuizResult {
  service: string;
  tier: string;
  seats: number;
  hours: number;
  rate: number;
  cost: string;
  title: string;
  blurb: string;
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'gap',
    q: 'Where is the work piling up right now?',
    help: 'The first pod should absorb the function that is costing your team the most hours — not the one that is easiest to hand off.',
    fyi: 'Most clients start with one function and add a second pod in month two, once the first is running without daily supervision.',
    options: [
      { value: 'back', label: 'Back office and admin', note: 'Inbox, orders, records, bookkeeping, account admin.' },
      { value: 'gtm', label: 'Marketing and revenue ops', note: 'CRM hygiene, campaigns, lifecycle email, reporting.' },
      { value: 'sdr', label: 'Pipeline and outbound', note: 'List building, sequences, cold calls, meeting setting.' },
      { value: 'mixed', label: 'Honestly, all of it', note: 'A small blended pod covering several functions.' },
    ],
  },
  {
    id: 'hours',
    q: 'How much coverage do you actually need?',
    help: 'Coverage drives cost far more than seniority does. Part-time seats are real — you do not have to buy 160 hours to start.',
    fyi: 'Anything past 40 hours a week means more than one person. Pods beat a single hire: two agents cover nights and weekends without overtime.',
    options: [
      { value: 'pt', label: 'Part-time, under 20 hrs/week', note: 'One seat, focused on a narrow set of tasks.' },
      { value: 'ft', label: 'Full-time, one person', note: '40 hrs/week of dedicated capacity.' },
      { value: 'shift', label: 'Extended hours or weekends', note: 'Two or more seats sharing a rota.' },
      { value: 'always', label: 'True 24/7', note: 'A pod of three to six across timezones.' },
    ],
  },
  {
    id: 'process',
    q: 'How documented is the work today?',
    help: 'This is the single best predictor of how fast a pod ramps. Nothing written down is fine — it just changes who we send first.',
    fyi: 'If there is no documentation, we build the SOP during onboarding and hand it back to you. You keep it whether or not you stay.',
    options: [
      { value: 'sop', label: 'Written SOPs we can hand over', note: 'Fastest ramp — days, not weeks.' },
      { value: 'some', label: "Some notes, mostly in people's heads", note: 'We document as we shadow your team.' },
      { value: 'none', label: 'Nothing written down', note: 'We build the process with you first.' },
    ],
  },
  {
    id: 'judgment',
    q: 'How much judgment does the role require?',
    help: 'This separates our two tiers. Pro agents are fully trained; Expert agents have more years and clear a much harder path.',
    fyi: 'You can mix tiers inside one pod — an Expert lead with Pro seats underneath is the most common shape, and the cheapest way to buy senior judgment.',
    options: [
      { value: 'pro', label: 'Repeatable, rules-based work', note: 'Clear inputs, clear outputs, defined escalation.' },
      { value: 'mid', label: 'Some ambiguity, escalates sometimes', note: 'Needs context but follows a playbook.' },
      { value: 'expert', label: 'Client-facing, high stakes', note: 'Owns outcomes, talks to your customers directly.' },
    ],
  },
  {
    id: 'timing',
    q: 'When do you want people working?',
    help: 'Our standard path is roughly two weeks from first call to a fully onboarded pod, including your free trial.',
    fyi: 'The consult is free and there is a free trial before you commit, so booking early costs you nothing even if the start date is months out.',
    options: [
      { value: 'now', label: 'Immediately — we are underwater', note: 'We can compress onboarding where SOPs exist.' },
      { value: 'soon', label: 'Within the next month', note: 'The standard two-week cycle fits.' },
      { value: 'later', label: 'Planning ahead for next quarter', note: 'We hold profiles and start when you say go.' },
    ],
  },
];
const SERVICE: Record<string, string> = {
  back: 'Virtual Back Office Team',
  gtm: 'GTM Team',
  sdr: 'SDR as a Service',
  mixed: 'Blended pod',
};

const SEATS: Record<string, number> = { pt: 1, ft: 1, shift: 2, always: 4 };
const HOURS: Record<string, number> = { pt: 80, ft: 160, shift: 320, always: 640 };

export const HOURS_LABEL: Record<string, string> = {
  pt: 'about 80 hrs/month (part-time)',
  ft: '160 hrs/month (one full-time seat)',
  shift: '320 hrs/month (two seats on a rota)',
  always: '640 hrs/month (a 24/7 pod)',
};

const ORDER: AnswerKey[] = ['gap', 'hours', 'process', 'judgment', 'timing'];
export const QUIZ_ORDER = ORDER;

function money(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

/** Score a set of answers into the estimate shown on the result screen. */
export function score(a: Answers): QuizResult {
  const service = SERVICE[a.gap] || '—';
  const seats = SEATS[a.hours] || 1;
  const hours = HOURS[a.hours] || 160;
  const expert = a.judgment === 'expert';
  const tier = expert ? 'Expert' : a.judgment === 'mid' ? 'Expert lead + Pro seats' : 'Pro';
  const rate = expert ? 11 : a.judgment === 'mid' ? 9 : 8;
  const ramp =
    a.process === 'sop'
      ? 'Because your process is documented, we can compress onboarding to under a week.'
      : a.process === 'some'
        ? 'We will shadow your team and write the SOP as part of onboarding.'
        : 'We will build the process with you first, then staff against it — that is included.';
  const when =
    a.timing === 'now'
      ? 'We can begin scoping the same week.'
      : a.timing === 'later'
        ? 'We can hold profiles until your start date.'
        : 'Two weeks from consult to live coverage.';
  return {
    service,
    tier,
    seats,
    hours,
    rate,
    cost: money(hours * rate) + '+',
    title:
      seats === 1 ? `A single ${expert ? 'Expert' : 'Pro'} seat, focused` : `A pod of ${seats}, sharing coverage`,
    blurb:
      `Start with ${seats === 1 ? 'one seat' : seats + ' seats'} on ` +
      service.toLowerCase() +
      '. ' +
      ramp +
      ' ' +
      when,
  };
}

/** Encode answers into the compact hash string shared as the URL fragment. */
export function encodeAnswers(a: Answers): string {
  return ORDER.map((key, i) => {
    const opts = QUIZ[i].options;
    const idx = opts.findIndex((o) => o.value === a[key]);
    return idx;
  }).join('');
}

/** Decode a 5-char hash (each char = option index) back into answers. */
export function decodeAnswers(code: string): Answers | null {
  if (!/^[0-4]{5}$/.test(code)) return null;
  const a = {} as Answers;
  for (let i = 0; i < ORDER.length; i++) {
    const opts = QUIZ[i].options;
    const opt = opts[Number(code[i])];
    if (!opt) return null;
    a[ORDER[i]] = opt.value;
  }
  return a;
}