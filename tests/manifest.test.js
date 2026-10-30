/**
 * Completeness test: runs the same validator an operator runs, as part of the
 * test suite, so a missing file, a drifted hash or an unaccounted asset fails
 * `npm test` instead of waiting for a manual check.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const run = promisify(execFile)
const ROOT = fileURLToPath(new URL('..', import.meta.url))

test('every upstream item is accounted for and hashes match', async () => {
  const { stdout } = await run(process.execPath, ['scripts/validate.mjs'], { cwd: ROOT })
  assert.match(stdout, /vendored snapshot: 13 files, all accounted for/)
  assert.match(stdout, /hashes verified: 13\/13/)
  assert.match(stdout, /verbatim runtime copies: 10/)
  assert.match(stdout, /no omissions/)
})

test('manifest declares no exclusions and no unresolved items', async () => {
  const manifest = JSON.parse(await readFile(new URL('../docs/source-manifest.json', import.meta.url), 'utf8'))
  assert.deepEqual(manifest.exclusions, [])
  assert.deepEqual(manifest.unresolved, [])
  assert.equal(manifest.items.length, 13)
  assert.equal(manifest.upstream.fileCount, 13)
  assert.equal(manifest.upstream.commit, 'a0b4f1ecff591100d207ddcc799bcb5bb769f031')

  const executable = manifest.items.filter((item) => item.disposition === 'executable')
  const reference = manifest.items.filter((item) => item.disposition === 'reference')
  assert.equal(executable.length, 10)
  assert.equal(reference.length, 3)

  for (const item of manifest.items) {
    assert.match(item.sha256, /^[0-9a-f]{64}$/, `${item.path} needs a sha256`)
    assert.ok(item.bytes > 0, `${item.path} needs a byte size`)
    assert.ok(item.targets.length > 0, `${item.path} needs at least one target`)
    assert.ok(item.reason, `${item.path} needs a stated reason`)
  }
})

test('package identity matches the spec', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(pkg.name, 'mulqi-reasll')
  assert.equal(pkg.version, '1.0.0')
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.match(pkg.engines.dsh, /0\.2\.1-rc\.2/)

  const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
  assert.match(patch, /name: mulqi-reasll/)

  const entry = await readFile(new URL('../index.js', import.meta.url), 'utf8')
  assert.match(entry, /displayName: 'Mulqi ReaSLL'/)
  assert.match(entry, /upstreamCommit: 'a0b4f1ec/)
})