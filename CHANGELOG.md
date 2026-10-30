# Changelog

All notable changes to the Mulqi ReaSLL plugin.

## 1.0.0 — 2026-10-31

Complete source preservation and DSH-native port, replacing the earlier
`dsh-reasll` 1.0.1 packaging.

The upstream skill is unchanged: every one of its 13 files is preserved
byte-for-byte, and the ten files the model reads are identical to the upstream
blobs by sha256.

### Identity

- Package renamed `dsh-reasll` → `mulqi-reasll`; version reset to `1.0.0`.
- Plugin display name is **Mulqi ReaSLL**.
- `cordis.patch.yml` now inserts `id: mulqi-reasll` / `name: mulqi-reasll`, so
  the bundle patch resolves to the package itself.

### Source preservation

- Added `vendor/upstream/` — the complete upstream tree at commit
  `a0b4f1ecff591100d207ddcc799bcb5bb769f031`, byte-identical, read-only, and
  never executed or registered.
- The three upstream files that had no target before now have one:
  `README.md`, `CHANGELOG.md`, and `LICENSE` are preserved as reference
  material. The root `LICENSE` remains byte-identical to the upstream licence.
- The shallow working clone that previously lived in `.upstream/` was removed
  after its tree was enumerated; provenance now ships inside the repository.

### Auditable change tracking

- Added `docs/SOURCE-MANIFEST.md` — the human-readable source-to-target
  manifest: path, sha256, byte size, disposition, targets, modifications, and
  the reason for every treatment.
- Added `docs/source-manifest.json` — the machine-readable twin that the
  validator enforces.

### Automated completeness validation

- Added `scripts/validate.mjs`, which checks seven things: vendored-snapshot
  coverage in both directions, sha256 and size per item, target existence,
  verbatim equality between `assets/` and `vendor/upstream/`, the absence of
  unaccounted assets, package/patch/skill consistency, and that every
  `references/…` and `templates/…` link cited by `SKILL.md` resolves.
- Added `tests/manifest.test.js` so completeness failures break `npm test`
  instead of waiting for a manual audit.
- Added `npm run validate` and `npm run check`.
- Fixed `npm test` for Node 24: `node --test tests/` treats the directory as a
  module; the script now uses `tests/*.test.js`.

### Documentation

- Added `HOWTOUSE.md` — both installation methods (GitHub repository and local
  directory), verification, migration from the old package name, activation
  boundaries, and troubleshooting.
- Added `docs/RECONCILIATION.md` — the transparent report: preserved, adapted,
  executable, non-executable, exclusions, and unresolved compatibility notes.
- Rewrote `README.md` for the new identity and added a source-completeness
  section.

### Runtime

- `index.js` keeps its behaviour: one bundled skill provider, `rank: 600`,
  `resourceBase` at `assets/`, frontmatter stripped at read time. It now also
  reports `upstreamCommit` and a `plugin` identity block in its metadata.
- No new tools, hooks, or listeners. No runtime dependencies. No build step.

## Upstream history

Preserved verbatim from the source skill
([Speedrunlab/reverse-engineer-anything-self-learning-loop](https://github.com/Speedrunlab/reverse-engineer-anything-self-learning-loop)).
The full text is at [`vendor/upstream/CHANGELOG.md`](vendor/upstream/CHANGELOG.md).

### 1.0.1 — 2026-10-26

Wording and attribution only, no change to the method.

### 1.0.0 — 2026-10-23

First release.

## Superseded

### dsh-reasll 1.0.1 — 2026-10-30

DSH port of the upstream skill release 1.0.1. The method, references and
templates were carried over unchanged; only the packaging was new.

- Packaged the skill as an installable DeepSeek Harness bundle
  (`dsh.bundle.patch`), so `dsh plugin add` registers it into a profile's
  `dsh.profile.bundles`.
- Registered the skill through `ctx.skills` as a bundled provider instead of a
  skills directory, so it is discovered by name like a built-in skill.
- Moved the frontmatter fields into plugin metadata and stripped the YAML block
  from the body the model reads; `assets/SKILL.md` still carries the original
  frontmatter verbatim.
- Pointed `resourceBase` at `assets/`, so the relative `references/…` and
  `templates/…` links in the body resolve without rewriting them.
- No runtime dependencies and no build step: the entry module is plain ESM.