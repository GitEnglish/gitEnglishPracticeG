import { describe, it, expect, beforeEach } from 'bun:test';
import { extractJson, toItems } from './openrouterService';
import { initActivityLogger, getActivityLogger } from './ActivityLogger';

describe('openrouterService JSON extraction and item normalization', () => {
  it('extracts JSON array from markdown code fences and surrounding prose', () => {
    const raw = 'Here are your items:\n```json\n{"questions":[{"question":"She [BLANK] to work.","answer":"walked","wordBank":["walked","walk","walking"]}]}\n```\nEnjoy!';
    const parsed = extractJson(raw);
    const items = toItems(parsed);
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBe(1);
    expect((items[0] as any).answer).toBe('walked');
  });

  it('handles escaped quotes inside JSON strings without breaking bracket depth', () => {
    const raw = '{"questions":[{"question":"Which word does NOT collocate with \\"heavy\\"?","options":["rain","traffic","sleep","idea"],"correctAnswer":"idea"}]}';
    const parsed = extractJson(raw);
    const items = toItems(parsed);
    expect(items.length).toBe(1);
    expect((items[0] as any).correctAnswer).toBe('idea');
  });

  it('normalizes bare arrays, wrapped arrays, and single objects into an item list', () => {
    expect(toItems([{ a: 1 }, { a: 2 }]).length).toBe(2);
    expect(toItems({ items: [{ a: 1 }] }).length).toBe(1);
    expect(toItems({ exercises: [{ a: 1 }, { a: 2 }, { a: 3 }] }).length).toBe(3);
    expect(toItems({ single: 'object' })).toEqual([{ single: 'object' }]);
  });

  it('throws clear errors when response has no JSON or malformed JSON', () => {
    expect(() => extractJson('No json here at all')).toThrow('AI response contained no JSON.');
    expect(() => extractJson('{"questions": [{"unclosed": true}')).toThrow('AI response contained malformed JSON.');
  });
});

describe('ActivityLogger focus item tracking', () => {
  beforeEach(() => {
    initActivityLogger('practice-genie', 'student_test');
  });

  it('records focus items with category, concept, performance_score, and errors', () => {
    const logger = getActivityLogger()!;
    logger.startSession();
    logger.startActivity('block_1_q_0', 'drill', 'FITB Q1');
    logger.logFocusItem('Vocabulary', 'embark on', 0, 1.0, 1, [], 'They decided to [BLANK] a new journey.');
    logger.endActivity();

    const payload = logger.endSession();
    expect(payload.activities.length).toBe(2); // session_start_event + drill
    const drill = payload.activities[1];
    expect(drill.activity_id).toBe('block_1_q_0');
    expect(drill.focus_items.length).toBe(1);
    expect(drill.focus_items[0].category).toBe('Vocabulary');
    expect(drill.focus_items[0].concept).toBe('embark on');
    expect(drill.focus_items[0].performance_score).toBe(1.0);
  });
});
