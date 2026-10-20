# Revision notes r2

Note: the first submit (draft version 2) failed schema because a lockedHint was over 90 characters. I shortened it and resubmitted as draft version 3, which the CLI recorded as revision 3. These notes cover the whole second round of changes.

## QA findings
- **Major, dead lock on `turn-mirror`:** removed the redundant requirement. The beam-or-help choice is now a free choice, and both endings are triumphs. The real lock stays on `wipe-mirror` at the threshold. It now needs the soft cloth (shed chest), the match tin and the `damp-mirror` clue (both from Gran Tull), so the player must visit both places.
- **Minor, mixed message on asking for help:** `ending-help` is now a triumph ("Asking for help had been brave, and it had worked"). The beam sweeps twice as fast with two keepers. Both endings are good. The setback ending is the one that skips the clue.
- **Minor, no way back from the threshold:** added a `go-down` choice to `gathering`. The locked hint now says where to look: the shed chest, and Gran Tull on the bench.
- **Minor, lamp lit with no light source:** the wind blew out the wick through the open window, and Fen shuts the window. Gran Tull gives Fen a match tin (new item `match-tin`) and says her knees are too old for the stairs. Fen strikes a match in `climax`.
- **Minor, inconsistent item use:** the cloth is only used for wiping. The turn choices now say "Pull the chain", and the chain is introduced in `climax`.
- **Minor, lantern and Gran Tull on the dock:** removed the lantern. The choice is now "Run down to the dock and wave". Gran Tull walks down the path to Fen in the ending.

## Literacy notes
- `chain` now appears in shed, climax, `ending-beam` and `ending-help`. It is still a vowel-team word, which I chose to keep because the brief requires it. `shut` is used in the shed, at the threshold (the window) and elsewhere. `moth` is used in the chest and the climax.
- Removed the placed-looking moth and Pip lines in `bench-clue`. Removed Gran Tull's unmotivated shell gift (she gives a hug instead). Reworded the stiff "much faster" line, and `much` is still used elsewhere.
- Replaced "thought" with "looked", so there is no irregular -ough word.
- Added glossary entries with syllable breaks: tower, window, answer, afraid, pocket, fluttered, matches. ("across" is no longer in the text.) Removed `lantern` because it is no longer in the text.
- Not changed: set totals and per-route counts need to be checked against the new validation report. The human literacy review is still required.
