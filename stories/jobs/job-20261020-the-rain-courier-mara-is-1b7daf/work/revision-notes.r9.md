# Revision notes r9

Content revision only: gave four single-choice, non-ending passages a genuine
second choice. No new endings were added; every new branch reconnects into
the existing passage graph or an existing ending. Version raised from 8 to 9.

## shop-pick ("The Tin Box")
- Problem: only one choice, "Turn into the dark alley" -> alley.
- Fix: reworded the closing lines to offer a real fork, then added a second
  choice, "Ride straight on to the crossing" -> `gathering`. This lets a
  reader skip the alley scene for now (and its clue) and head straight to
  the tower-lights hub, where `gather-alley` still lets them go back for it.
  Tagged the new choice `sequencing` (it is a genuine pacing/order decision,
  matching the `gathering` passage's own "first came the shop or the
  alley" framing).
- Kept the existing choice (relabelled "Duck into the dark alley" for
  parallel phrasing) pointing at `alley`, unchanged in effect.

## alley-clue ("The Little Stamp")
- Problem: only one choice, "Ride on to the tower lights" -> gathering.
- Fix: added a line establishing a back lane, then a second choice, "Slip
  down the back lane toward the bridge" -> `drone-street`. This is a real
  shortcut: it skips the `gathering` hub (and the chance to double back for
  Tam's pick set if the reader never visited the shop), so it changes which
  endings are realistically reachable without being a trap (climax-hack and
  its endings are always open). Tagged `sequencing`.
- Kept the existing choice to `gathering` unchanged.

## hide-shade ("Still as Stone")
- Problem: only one choice, "Walk the bike to the bridge gate" -> threshold.
- Fix: added a line where Nine warns more drones may be waiting, tempting
  Mara to give up early, then a second choice, "Wave the drone down and give
  up the bag" -> `ending-5` (the existing setback ending, reused from an
  earlier point in the story). This mirrors the `call-drone` temptation
  already offered later at `threshold`, reinforcing the trust/promise theme
  with a second, earlier chance to take the easy way out. No new ending
  needed. Tagged `inference`.
- Kept the existing choice to `threshold` unchanged.

## dash-past ("The Fast Way")
- Problem: only one choice, "Ride on to the bridge gate" -> threshold.
- Fix: added a line where the street forks, then a second choice, "Duck
  into the shaded doorway to catch her breath" -> `hide-shade`. A reader who
  chose the fast, risky dash can downshift into the careful hiding scene,
  which they have not read yet on this route (drone-street only ever sends a
  reader down one of hide-shade/dash-past, never both), so this is new
  content, not backtracking. `hide-shade` does not link back to `dash-past`,
  so there is no loop. Tagged `sequencing`.
- Kept the existing choice to `threshold` unchanged.

## Other passages checked
Reviewed every non-ending passage (start, shop, shop-pick, alley, alley-clue,
gathering, drone-street, hide-shade, dash-past, threshold, climax-gate,
climax-hack). Only the four listed above had a single choice; all others
already offered 2-3 genuinely different choices. No extra offenders found.

## New passages / endings
None added. All new choices link into passages or endings that already
existed (`gathering`, `drone-street`, `hide-shade`, `ending-5`), so the
story still has exactly 5 endings, all reachable.

## Validation
`npm run story -- submit-draft` on revision 9 reported:
`schema: ok; graph: ok, 5/5 endings reachable; literacy checks: ok; brief: ok`
on the first submission of this revision. No resubmission was needed.
