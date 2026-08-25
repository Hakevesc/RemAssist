/**
 * Quiz parity test — §13.2, the highest-value test in the suite.
 *
 * Every combination of the 5 questions (4 × 4 × 3 × 3 × 3 = 432) must:
 *   1. Score without throwing.
 *   2. Produce a cost that equals hours × rate (the quote arithmetic).
 *   3. Reflect the chosen tier/seat/hours in the returned shape.
 *   4. Round-trip through encode → decode unchanged.
 *
 * This pins the single-source-of-truth in lib/quiz/quiz.ts (§8) so /qualify and
 * the home page can never drift apart on pricing.
 */
import { describe, it, expect } from 'vitest';
import {
  QUIZ,
  score,
  encodeAnswers,
  decodeAnswers,
  type Answers,
  type AnswerKey,
} from './quiz';

function combinations(): Answers[] {
  const out: Answers[] = [];
  const keys = QUIZ.map((q) => q.id);
  function walk(depth: number, acc: Record<AnswerKey, string>) {
    if (depth === keys.length) {
      out.push(acc as Answers);
      return;
    }
    const key = keys[depth] as AnswerKey;
    for (const opt of QUIZ[depth].options) {
      walk(depth + 1, { ...acc, [key]: opt.value } as Record<AnswerKey, string>);
    }
  }
  walk(0, {} as Record<AnswerKey, string>);
  return out;
}

describe('quiz parity (432 cases)', () => {
  const cases = combinations();

  it('enumerates all 432 combinations', () => {
    expect(cases.length).toBe(432);
    // 4 gap × 4 hours × 3 process × 3 judgment × 3 timing
    expect(cases).toHaveLength(4 * 4 * 3 * 3 * 3);
  });

  it.each(cases)('scores %s consistently', (answers) => {
    const r = score(answers);
    // Quote arithmetic: cost = hours × rate, formatted with the "+" suffix.
    expect(r.cost).toBe('$' + (r.hours * r.rate).toLocaleString('en-US') + '+');
    // Seats/hours derive from the hours answer.
    const expectedHours =
      answers.hours === 'pt' ? 80 : answers.hours === 'ft' ? 160 : answers.hours === 'shift' ? 320 : 640;
    expect(r.hours).toBe(expectedHours);
    // Tier/rate depends on judgment.
    if (answers.judgment === 'expert') {
      expect(r.tier).toBe('Expert');
      expect(r.rate).toBe(11);
    } else if (answers.judgment === 'mid') {
      expect(r.rate).toBe(9);
    } else {
      expect(r.rate).toBe(8);
    }
    // Non-empty, correct shape.
    expect(r.service.length).toBeGreaterThan(0);
    expect(r.title.length).toBeGreaterThan(0);
    expect(r.blurb.length).toBeGreaterThan(0);
    expect(r.seats).toBeGreaterThan(0);
  });

  it('round-trips every combination through encode → decode', () => {
    for (const a of cases) {
      const code = encodeAnswers(a);
      const back = decodeAnswers(code);
      expect(back).not.toBeNull();
      expect(back).toEqual(a);
    }
  });

  it('rejects malformed hashes', () => {
    expect(decodeAnswers('')).toBeNull();
    expect(decodeAnswers('1234')).toBeNull(); // too short
    expect(decodeAnswers('123456')).toBeNull(); // too long
    expect(decodeAnswers('99999')).toBeNull(); // out of range digits
  });
});