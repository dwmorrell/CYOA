# End-to-end story workflow demonstration

Run at 2026-10-20T20:23:39.924Z in a temporary sandbox; the repository is not modified.
Source: real job job-20261020-the-fog-over-pebble-bay-ec899d, revision 4 by narrative-designer (ai-agent).

## 1. Structured request to planned job (executable)
  job job-20261020-the-fog-over-pebble-bay-ec899d: requested -> briefed -> planned
  artifacts: request, brief, continuity, outline, weavePlan, generationPrompt

## 2. Agent draft to validated draft (executable; draft written by the narrative-designer agent)
  state: in-review
  schema: ok
  graph: ok, 3/3 endings reachable
  literacy checks: ok
  brief: ok

## 3. Gate checks that must refuse (executable)
  refused as expected: publishing straight after validation
    -> Publication blocked:
  refused as expected: the narrative author reviewing its own draft
    -> The narrative author cannot be the QA reviewer
  refused as expected: a parent approval before reviews pass
    -> Parent approval needs all reviews to pass first (job is "in-review")

## 4. Specialist agent reviews (executable; real reviews replayed from the repository)
  literacy review by literacy-specialist (ai-agent): pass, 10 finding(s) -> job in-review
  qa review by qa-engineer (ai-agent): pass, 6 finding(s) -> job in-review
    PASS draft-exists: Revision 1, story v4
    PASS automated-validation: schema: ok; graph: ok, 3/3 endings reachable; literacy checks: ok; brief: ok
    PASS review:qa: qa passed by qa-engineer (ai-agent)
    WAIT review:literacy: literacy review passed only by ai-agent; policy requires a human literacy reviewer
    PASS story-literacy-claim: Story literacy review is "pending"
    WAIT parent-approval: Waiting for a parent decision

## 5. Human steps (SIMULATED in this sandbox; no person took part)
  simulated human literacy review: pass -> awaiting-parent-approval
  simulated parent decision: approved -> approved
  publish into the sandbox catalog: published; sandbox catalog has 1 published story
    PASS draft-exists: Revision 1, story v4
    PASS automated-validation: schema: ok; graph: ok, 3/3 endings reachable; literacy checks: ok; brief: ok
    PASS review:qa: qa passed by qa-engineer (ai-agent)
    PASS review:literacy: literacy passed by Literacy tutor (SIMULATED) (human)
    PASS story-literacy-claim: Story literacy review is "pending"
    PASS parent-approval: approved by Parent (SIMULATED) on revision 1

## 6. Revision invalidation (executable)
  new revision 2 (story v5) -> in-review
  stale reviews: 3 of 3; stale parent decisions: 1
  child library still shows version 4 until the new revision passes every gate

## Limits of this demonstration
- Story drafting and the QA and literacy pre-reviews were done by Claude Code agents before this run; the demo replays their recorded output.
- The human literacy review, parent approval and publication above are simulated in a sandbox. In the real repository the sample story remains unpublished with its literacy review pending.
