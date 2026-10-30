# Changelog

## 1.0.1 — 2026-10-30

DSH port of the upstream skill release 1.0.1. The method, references and
templates are carried over unchanged; only the packaging is new.

- Package the skill as an installable DeepSeek Harness bundle (`dsh.bundle.patch`),
  so `dsh plugin add` registers it into a profile's `dsh.profile.bundles`.
- Register the skill through `ctx.skills` as a bundled provider instead of a
  skills directory, so it is discovered by name like a built-in skill.
- Move the frontmatter fields into plugin metadata and strip the YAML block from
  the body the model reads; `assets/SKILL.md` still carries the original
  frontmatter verbatim.
- Point `resourceBase` at `assets/`, so the relative `references/…` and
  `templates/…` links in the body resolve without rewriting them.
- No runtime dependencies and no build step: the entry module is plain ESM.

## Upstream history

### 1.0.1 — 2026-10-26

Wording and attribution only, no change to the method.

### 1.0.0 — 2026-10-23

First release: the completion loop, the parity checklist per product class, the
fresh-eyes review pass, regression sampling, stop conditions and the hand-over
set; the examination method condensed from Reverse Engineer Anything v1.14; the
self-learning loop adapted from Hermes Agent as a Skill File v2.1; fix recipes by
cause; four templates.
