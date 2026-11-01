# Changelog

All notable changes to the Mulqi ReaSLL plugin.

## 1.0.2 — 2026-11-01

Section 0 is no longer a blocking authorisation gate. It is an optional intake:
the same questions are asked and recorded in the run ledger, but a missing or
partial answer no longer stops work before it starts.

### Changed

- `SKILL.md`: Section 0 retitled `INTAKE AND SCOPE (RECOMMENDED)`. The clause
  forbidding tools before intake is gone; `Authority record` becomes `Authority,
  when you have one` and explicitly allows recording yourself as approver; the
  `compatibility` line no longer requires an independent approver; the
  description reads `authorisation-aware` instead of `authorisation-gated`.
- `references/examine.md`: `the gate's mode` becomes `the recorded mode`.
- `references/review.md`: `under the gate` becomes `under the recorded scope`.
- `templates/run-ledger.md`: the `intake:` line accepts `none recorded` plus the
  reason.
- `index.js` and `package.json`: the runtime description no longer advertises
  the skill as authorisation-gated, and the version is now 1.0.2.
  `BUNDLED_SKILL_RANK` (600) and the candidate `rank` field stay: the registry
  rejects a candidate whose `rank` is not a finite number.
- `tests/manifest.test.js` and `scripts/validate.mjs`: the pinned version is
  1.0.2.
- `README.md`, `HOWTOUSE.md`, `docs/RECONCILIATION.md`, `docs/SOURCE-MANIFEST.md`,
  `docs/source-manifest.json`: document the optional intake and the local
  divergence from upstream instead of claiming full byte-identity.

### Provenance

The four edited files were copied to `vendor/upstream/` as well, so the executed
copy and the provenance copy stay byte-identical to each other and both match
the manifest hashes. The claim of byte-identity with upstream `a0b4f1e` now
covers the nine files this release did not touch; the four diverged files are
listed with both upstream and local hashes in `docs/SOURCE-MANIFEST.md`.

## 1.0.1 — 2026-11-01

Repairs the byte-identity claim that 1.0.0 broke, without touching upstream text.

`a79cfec` had appended DSH-specific notes directly into three `assets/references/`
files (`learning-loop.md`, `parity-checklist.md`, `review.md`) while
`vendor/upstream/` kept the pristine blobs. That made `scripts/validate.mjs`
fail on three verbatim checks and made the CHANGELOG's "identical to the
upstream blobs by sha256" claim untrue.

### Fixed

- Restored `assets/references/{learning-loop,parity-checklist,review}.md` to the
  upstream blobs, so `verbatim runtime copies` is 10/10 again.
- Moved those additions to `assets/references/dsh-notes.md`, which reproduces
  each added block verbatim and states which upstream reference it extends.
- Registered the new file in `docs/source-manifest.json` under `authored`, with
  its sha256 and byte size.
- `scripts/validate.mjs` now hashes authored runtime files and counts them as
  claimed assets, so a future drift in `dsh-notes.md` fails the same way an
  upstream file would.

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