import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkAgent, EXPECTED_AGENTS, loadAgents, parseAgent } from '../../scripts/lib/agents';
import { ROOT } from '../helpers';

describe('agent definitions', () => {
  const agents = loadAgents(ROOT);

  it('defines exactly the nine specialist agents', () => {
    expect(agents.map((a) => a.frontmatter.name).sort()).toEqual([...EXPECTED_AGENTS].sort());
  });

  it.each(EXPECTED_AGENTS)('%s has valid front matter, every required section and real file references', (name) => {
    const a = agents.find((x) => x.frontmatter.name === name)!;
    expect(checkAgent(a, (p) => existsSync(join(ROOT, p)))).toEqual([]);
  });

  it('the narrative designer is barred from reviewing or approving its own work', () => {
    const a = agents.find((x) => x.frontmatter.name === 'narrative-designer')!;
    expect(a.body).toMatch(/may not review, pass or approve your own work/);
  });

  it('reviewing agents are told their AI reviews are not human approval', () => {
    expect(agents.find((x) => x.frontmatter.name === 'literacy-specialist')!.body).toMatch(/never counts as the human literacy review/);
    expect(agents.find((x) => x.frontmatter.name === 'qa-engineer')!.body).toMatch(/cannot review work you wrote/);
  });

  it('reports structural problems in a bad definition', () => {
    const bad = parseAgent('/x/bad.md', '---\nname: Bad Name\n---\n## Mission and scope\nSee `docs/NOPE.md`.');
    const problems = checkAgent(bad, () => false);
    expect(problems.join('\n')).toMatch(/lowercase/);
    expect(problems.join('\n')).toMatch(/missing section "Handoff"/);
    expect(problems.join('\n')).toMatch(/missing path docs\/NOPE.md/);
  });
});
