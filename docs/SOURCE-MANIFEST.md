# Source-to-Target Manifest

Every item discovered in the upstream repository is listed here with its content
hash, its target in this plugin, its disposition, and the reason for any
treatment other than a straight copy.

The machine-readable twin is [`source-manifest.json`](./source-manifest.json).
`scripts/validate.mjs` enforces it: hashes, byte sizes, target existence,
verbatim equality between `assets/` and `vendor/upstream/`, and the absence of
unaccounted files. This document is the human-readable view of the same data.

## Upstream identity

| Field | Value |
| --- | --- |
| Repository | https://github.com/Speedrunlab/reverse-engineer-anything-self-learning-loop |
| Commit | `a0b4f1ecff591100d207ddcc799bcb5bb769f031` |
| Ref | `refs/heads/main` |
| Commit subject | Release 1.0.1: wording and attribution |
| Commit date | 2026-10-26T10:54:15+11:00 |
| Licence | MIT (Speedrun AI Labs) |
| Files at that commit | 13 |
| Preserved snapshot | `vendor/upstream/` (read-only, byte-identical) |

The complete tree at that commit was enumerated with `git ls-tree -r` before the
working clone was removed. A shallow clone still carries the full tree of its
tip commit, so 13 is the complete file count, not a sample. `git ls-remote`
confirmed that `a0b4f1e` is still the upstream `HEAD`.

## Dispositions

- **executable** — shipped in `assets/` and loaded at runtime by `index.js`
  through `ctx.skills`.
- **reference** — preserved byte-for-byte as provenance; never executed and
  never registered with the skill registry.
- **authored** — newly written for the DSH port; not upstream content.

## Items

| # | Source path | SHA-256 | Bytes | Disposition | Target(s) | Modifications | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `SKILL.md` | `9a04075a36586e5147f7cb1e43a2e75ab7405a7704f3327a6f7053b1484bb3be` | 19840 | executable | `assets/SKILL.md`, `vendor/upstream/SKILL.md` | None on disk. At runtime the leading YAML frontmatter is stripped and the same metadata is supplied programmatically. | Primary instruction body. `assets/` is the runtime copy; `vendor/` is the provenance copy. |
| 2 | `references/examine.md` | `7ef9ae34dfc8722f700d1d7cff4137df108af6de3190695370795a393a43b2a1` | 11756 | executable | `assets/references/examine.md`, `vendor/upstream/references/examine.md` | None | Cited by `SKILL.md`; resolved through `resourceBase` at `assets/`. |
| 3 | `references/fix-recipes.md` | `69c7a0f951ed7f67fcd6f8a44e1f8127022c38751942e680df1e9130db55c13d` | 3739 | executable | `assets/references/fix-recipes.md`, `vendor/upstream/references/fix-recipes.md` | None | Cited by `SKILL.md`; resolved through `resourceBase`. |
| 4 | `references/learning-loop.md` | `1cf68e811b3ac8f8bb76e89543e9c7d0eb89a0796b1b381fd95ff042251dea8f` | 6457 | executable | `assets/references/learning-loop.md`, `vendor/upstream/references/learning-loop.md` | None | Cited by `SKILL.md`; resolved through `resourceBase`. |
| 5 | `references/parity-checklist.md` | `475258fb076629722966e71dd760658d77737598ec552485741698ee2d8f4419` | 6046 | executable | `assets/references/parity-checklist.md`, `vendor/upstream/references/parity-checklist.md` | None | Cited by `SKILL.md`; resolved through `resourceBase`. |
| 6 | `references/review.md` | `41cd6ea8beab67c968029087bdd0fcbf5cdb9197ca9867ee2cb97b70db640f19` | 4630 | executable | `assets/references/review.md`, `vendor/upstream/references/review.md` | None | Cited by `SKILL.md`; resolved through `resourceBase`. |
| 7 | `templates/gap-report.md` | `c93562ccde019a7542b51041f0541cbfa3102332e1fe146d746d8eaa45b8f50c` | 922 | executable | `assets/templates/gap-report.md`, `vendor/upstream/templates/gap-report.md` | None | Cited by `SKILL.md`; the agent copies it into the working project. |
| 8 | `templates/iteration-plan.md` | `8b6caed3307a26d3f195485d50430e7775225ac98f774d9a0c38f2df78266d72` | 607 | executable | `assets/templates/iteration-plan.md`, `vendor/upstream/templates/iteration-plan.md` | None | Cited by `SKILL.md`; the agent copies it into the working project. |
| 9 | `templates/parity-checklist.md` | `5cf78ee685b62b246cd7ef5083b4e814b450728ad6ae93d8584ff68c7941cd56` | 1059 | executable | `assets/templates/parity-checklist.md`, `vendor/upstream/templates/parity-checklist.md` | None | Cited by `SKILL.md`; defines the written 100% checklist the loop must pass. |
| 10 | `templates/run-ledger.md` | `76a6eff0360cfdbaf1b6ddebdfb783099a3cfe27ab671608252dfa6249010b8a` | 1283 | executable | `assets/templates/run-ledger.md`, `vendor/upstream/templates/run-ledger.md` | None | Cited by `SKILL.md`; records iteration evidence. |
| 11 | `README.md` | `2202775d9b467e6a32d5a26e797613c70be6067f9b88ec9456988499d8c716e6` | 7809 | reference | `vendor/upstream/README.md` | None. Not copied into `assets/`, not registered with `ctx.skills`. | Documents the Claude-Code-style install, which does not apply to DSH. Kept verbatim as provenance; the port is documented in the root `README.md` and `HOWTOUSE.md` instead. |
| 12 | `CHANGELOG.md` | `4c58ee54b6c637ad60b262600adfebc398712cc274bbdfbcef1d78950d76fec9` | 1266 | reference | `vendor/upstream/CHANGELOG.md` | None. The port keeps its own root `CHANGELOG.md` and quotes the upstream history there. | Release history of the source skill, not of the plugin. Retained verbatim as provenance. |
| 13 | `LICENSE` | `77708ce90affbd4ced3e3a50b393479c8dff9b3a19c93bc6490efe9a1002b96a` | 1081 | reference | `LICENSE`, `vendor/upstream/LICENSE` | None; the root `LICENSE` is byte-identical. | MIT licence of the source skill. Must ship with the derived work. |

## Authored files

These files carry no upstream content. They are listed so the package contents
are fully accounted for.

| Path | Role |
| --- | --- |
| `index.js` | Cordis plugin: registers the skill provider with `ctx.skills`, strips frontmatter at read time. |
| `cordis.patch.yml` | Bundle patch that inserts the plugin row into a DSH profile layer. |
| `package.json` | Package manifest: `mulqi-reasll` 1.0.0, `dsh.bundle.patch`, `engines.dsh`. |
| `HOWTOUSE.md` | Install and usage guide for both installation methods. |
| `README.md` | Port overview in Indonesian; supersedes the upstream README for DSH users. |
| `CHANGELOG.md` | Plugin release history, with upstream history preserved underneath. |
| `AGENTS.md` | Repository agent rules (pre-existing). |
| `docs/SOURCE-MANIFEST.md` | This document. |
| `docs/source-manifest.json` | Machine-readable manifest enforced by the validator. |
| `docs/RECONCILIATION.md` | Reconciliation report. |
| `scripts/validate.mjs` | Automated completeness validation. |
| `tests/plugin.test.js` | Integration test against the real DSH skill registry. |
| `tests/manifest.test.js` | Completeness test wrapper around the validator. |

## Exclusions

None. All 13 upstream files are preserved in this repository.

## Unresolved

None.