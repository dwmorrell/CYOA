import { EXPECTED_AGENTS } from './agents';

export interface WorkItem {
  id: string;
  stage: number;
  title: string;
  agent: string;
  producedBy: string;
  artifacts: string[];
  dependsOn: string[];
  acceptance: string[];
  checks: string[];
  status: 'pending' | 'in-progress' | 'ready-for-review' | 'in-review' | 'done' | 'blocked';
  review: null | string | { reviewer: string; verdict: 'pass' | 'changes-requested'; evidence: string[]; at: string };
  defects: { id: string; description: string; status: 'open' | 'fixed' | 'wontfix' }[];
}

export interface Requirement {
  id: string;
  title: string;
  status: 'implemented' | 'partial' | 'pending' | 'blocked';
  evidence: string[];
  tests: string[];
  gaps: string[];
}

/** Dependency order (stable by stage then id). Throws on cycles or unknown dependencies. */
export function orderItems(items: WorkItem[]): WorkItem[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  const done = new Set<string>();
  const visiting = new Set<string>();
  const out: WorkItem[] = [];
  const visit = (i: WorkItem) => {
    if (done.has(i.id)) return;
    if (visiting.has(i.id)) throw new Error(`Dependency cycle at ${i.id}`);
    visiting.add(i.id);
    for (const d of i.dependsOn) {
      const dep = byId.get(d);
      if (!dep) throw new Error(`${i.id} depends on unknown item ${d}`);
      visit(dep);
    }
    visiting.delete(i.id);
    done.add(i.id);
    out.push(i);
  };
  [...items].sort((a, b) => a.stage - b.stage || a.id.localeCompare(b.id)).forEach(visit);
  return out;
}

export function checkItems(items: WorkItem[], exists: (p: string) => boolean): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  const byId = new Map(items.map((i) => [i.id, i]));
  for (const i of items) {
    if (ids.has(i.id)) problems.push(`${i.id}: duplicate id`);
    ids.add(i.id);
    if (!EXPECTED_AGENTS.includes(i.agent)) problems.push(`${i.id}: unknown agent "${i.agent}"`);
    if (!i.acceptance.length) problems.push(`${i.id}: no acceptance criteria`);
    if (i.status !== 'pending')
      for (const a of i.artifacts) if (!exists(a)) problems.push(`${i.id}: artifact ${a} does not exist`);
    if (i.status === 'done') {
      for (const d of i.dependsOn) if (byId.get(d)?.status !== 'done') problems.push(`${i.id}: done before its dependency ${d}`);
      if (typeof i.review !== 'object' || i.review === null) problems.push(`${i.id}: done without a review record`);
      else {
        if (i.review.reviewer === i.agent) problems.push(`${i.id}: reviewed by its own responsible agent`);
        if (i.review.verdict !== 'pass') problems.push(`${i.id}: done although review requested changes`);
      }
      if (i.defects.some((d) => d.status === 'open')) problems.push(`${i.id}: done with open defects`);
    }
  }
  try {
    orderItems(items);
  } catch (e) {
    problems.push((e as Error).message);
  }
  return problems;
}

/** Items whose dependencies are done but which are not done themselves. */
export function nextItems(items: WorkItem[]): WorkItem[] {
  const status = new Map(items.map((i) => [i.id, i.status]));
  return orderItems(items).filter((i) => i.status !== 'done' && i.dependsOn.every((d) => status.get(d) === 'done'));
}

export function checkRequirements(reqs: Requirement[], exists: (p: string) => boolean, testSource: string): string[] {
  const problems: string[] = [];
  for (const r of reqs) {
    if (r.status === 'implemented' && r.evidence.length === 0) problems.push(`${r.id}: implemented with no evidence`);
    for (const e of r.evidence) if (!exists(e)) problems.push(`${r.id}: evidence ${e} does not exist`);
    for (const t of r.tests) if (!testSource.includes(t)) problems.push(`${r.id}: test "${t}" not found in tests/`);
  }
  return problems;
}
