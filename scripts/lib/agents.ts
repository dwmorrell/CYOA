import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const REQUIRED_SECTIONS = [
  'Mission and scope',
  'Required expertise and responsibilities',
  'Exclusions and limits of authority',
  'Required inputs',
  'Required output artifacts',
  'Acceptance criteria',
  'Handoff',
  'Escalate',
  'Relevant files',
];

export const EXPECTED_AGENTS = [
  'orchestrator',
  'product-architect',
  'ux-designer',
  'literacy-specialist',
  'narrative-designer',
  'app-engineer',
  'qa-engineer',
  'accessibility-compatibility-reviewer',
  'release-manager',
];

export interface AgentDef {
  file: string;
  frontmatter: Record<string, string>;
  body: string;
}

export function parseAgent(file: string, text: string): AgentDef {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { file, frontmatter: {}, body: text };
  const frontmatter: Record<string, string> = {};
  for (const line of m[1]!.split('\n')) {
    const kv = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (kv) frontmatter[kv[1]!] = kv[2]!.trim();
  }
  return { file, frontmatter, body: m[2]! };
}

export function checkAgent(def: AgentDef, repoFiles: (p: string) => boolean): string[] {
  const problems: string[] = [];
  const name = def.frontmatter.name;
  if (!name) problems.push('front matter has no name');
  else if (!/^[a-z][a-z0-9-]*$/.test(name)) problems.push(`name "${name}" must be lowercase letters and hyphens`);
  if (name && !def.file.endsWith(`${name}.md`)) problems.push(`file name should be ${name}.md`);
  if (!def.frontmatter.description || def.frontmatter.description.length < 40) problems.push('description is missing or too short to guide delegation');
  if (!def.frontmatter.tools) problems.push('tools list is missing');
  const headings = [...def.body.matchAll(/^##\s+(.+)$/gm)].map((h) => h[1]!);
  for (const s of REQUIRED_SECTIONS) if (!headings.some((h) => h.startsWith(s))) problems.push(`missing section "${s}"`);
  for (const ref of def.body.matchAll(/`((?:docs|src|schemas|config|scripts|prompts|workflow|tests|\.github)\/[^`*<>\s]*)`/g)) {
    const p = ref[1]!.replace(/\/$/, '');
    if (!repoFiles(p)) problems.push(`references missing path ${p}`);
  }
  return problems;
}

export function loadAgents(root: string): AgentDef[] {
  const dir = join(root, '.claude', 'agents');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => parseAgent(join(dir, f), readFileSync(join(dir, f), 'utf8')));
}
