import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkItems, nextItems, orderItems, type WorkItem } from '../../scripts/lib/workflow';
import { ROOT } from '../helpers';

const items = (JSON.parse(readFileSync(join(ROOT, 'workflow', 'work-items.json'), 'utf8')) as { items: WorkItem[] }).items;
const item = (id: string, over: Partial<WorkItem> = {}): WorkItem => ({
  id,
  stage: 1,
  title: id,
  agent: 'app-engineer',
  producedBy: 'test',
  artifacts: [],
  dependsOn: [],
  acceptance: ['works'],
  checks: [],
  status: 'pending',
  review: null,
  defects: [],
  ...over,
});

describe('orchestrated workflow', () => {
  it('work items reference real artifacts and agents', () => {
    expect(checkItems(items, (p) => existsSync(join(ROOT, p)))).toEqual([]);
  });

  it('orders work items by dependency', () => {
    const order = orderItems([item('C', { dependsOn: ['B'] }), item('B', { dependsOn: ['A'], stage: 0 }), item('A', { stage: 5 })]).map((i) => i.id);
    expect(order).toEqual(['A', 'B', 'C']);
    expect(() => orderItems([item('A', { dependsOn: ['B'] }), item('B', { dependsOn: ['A'] })])).toThrow(/cycle/);
  });

  it('rejects done items that skipped review, reviewed themselves or kept open defects', () => {
    const problems = checkItems(
      [
        item('A', { status: 'done' }),
        item('B', { status: 'done', review: { reviewer: 'app-engineer', verdict: 'pass', evidence: [], at: '' } }),
        item('C', { status: 'done', review: { reviewer: 'qa-engineer', verdict: 'pass', evidence: [], at: '' }, defects: [{ id: 'D', description: 'x', status: 'open' }] }),
      ],
      () => true,
    );
    expect(problems.join('\n')).toMatch(/A: done without a review record/);
    expect(problems.join('\n')).toMatch(/B: reviewed by its own responsible agent/);
    expect(problems.join('\n')).toMatch(/C: done with open defects/);
  });

  it('offers only items whose dependencies are done', () => {
    const next = nextItems([item('A', { status: 'done', review: { reviewer: 'qa-engineer', verdict: 'pass', evidence: [], at: '' } }), item('B', { dependsOn: ['A'] }), item('C', { dependsOn: ['B'] })]);
    expect(next.map((i) => i.id)).toEqual(['B']);
  });
});
