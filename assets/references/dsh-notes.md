# DSH port notes

Additions written for the DeepSeek Harness port. They live here rather than in
the files the skill body cites so every upstream file stays byte-identical to
`Speedrunlab/reverse-engineer-anything-self-learning-loop` at `a0b4f1e` — in
`vendor/upstream/` (provenance) and in `assets/` (runtime) alike.

Read a section below alongside the upstream reference it extends.

**Extends `references/learning-loop.md`**

## Proving a skill loads (DSH)

When the target is a skill file and the build must be proven loadable, the
discovery roots and their precedence are read from the loader, not guessed:

- Rank order, lowest wins a name collision: `<project>/.dsh/skills` (100),
  `<project>/.agents/skills` (200), custom dirs (300), `$DSH_HOME/skills` (400),
  `~/.agents/skills` (500), bundled (600).
- Frontmatter needs only `name` and `description`; unknown keys are ignored,
  accepted extras are `whenToUse`, `disable-model-invocation`,
  `user-invocable`, `metadata`. The name must match
  `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- A provider's candidates carry `name`, `description`, `invocation`, `provider`,
  `source`, `resourceBase`, `rank`, `metadata`; `get()` returns the body with
  the frontmatter already stripped.

Install a test copy under `<project>/.dsh/skills/<name>/SKILL.md`: it outranks
the user root and stays writable under a workspace-write sandbox, while
`$DSH_HOME/skills` may be read-only. Prove the load with the session's own
available-skills catalog listing the name, and with a fresh interpreter process
that imports the provider — a pass inside the building process proves nothing
about a cold start.

**Extends `references/parity-checklist.md`**

- **Two clean rounds mean two processes.** The second confirmation pass runs
  from a fresh process and a fresh cache, or it re-tests the builder's memory
  instead of the artifact. A pass that depends on state the builder left
  behind is not a pass.
- **A gap carries an id and a reason.** List every exclusion as `O<n>` with the
  reason it is out. An exclusion without an id is an omission the operator will
  find later and read as concealment.

**Extends `references/review.md`**

- **Verbatim reuse.** When the build must not copy protected expression,
  compare by word n-gram against the source and report the **longest** shared
  run, then read that run. An aggregate similarity score hides the one real
  copy, and templates, code fences and tables are where copying hides: a
  `step -> verify: check` block is reused text even when no prose sentence is.
  Set the threshold in the checklist when the item is written, and fix the
  template rather than lowering the threshold to pass.
