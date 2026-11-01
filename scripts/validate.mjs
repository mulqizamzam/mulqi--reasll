#!/usr/bin/env node
/**
 * Automated completeness validation for Mulqi ReaSLL.
 *
 * Enforces docs/source-manifest.json as the single source of truth:
 *   1. the vendored upstream snapshot is exactly the manifest's item set;
 *   2. every item's sha256 and byte size match the file on disk;
 *   3. every declared target exists;
 *   4. every executable item is byte-identical between assets/ and vendor/;
 *   5. assets/ contains no file the manifest does not account for;
 *   6. the package manifest, bundle patch and skill body agree with each other;
 *   7. every references/ and templates/ link cited by SKILL.md resolves.
 *
 * Exits 1 on any failure. No dependencies.
 */

import { createHash } from 'node:crypto'
import { readFile, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const MANIFEST = join(ROOT, 'docs', 'source-manifest.json')
const UPSTREAM_DIR = join(ROOT, 'vendor', 'upstream')
const ASSETS_DIR = join(ROOT, 'assets')

const failures = []
const checks = []

const fail = (message) => failures.push(message)
const pass = (message) => checks.push(message)
const rel = (absolute) => relative(ROOT, absolute).split(sep).join('/')

/** Recursively list regular files under `dir`, as repo-relative POSIX paths. */
async function listFiles(dir) {
  const out = []
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const full = join(current, entry.name)
      if (entry.isDirectory()) await walk(full)
      else if (entry.isFile()) out.push(full)
    }
  }
  await walk(dir)
  return out.sort()
}

const sha256 = async (file) => createHash('sha256').update(await readFile(file)).digest('hex')

async function main() {
  if (!existsSync(MANIFEST)) {
    console.error('FAIL: docs/source-manifest.json is missing')
    process.exit(1)
  }

  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))
  const items = manifest.items ?? []
  const byPath = new Map(items.map((item) => [item.path, item]))

  // --- 1. vendored snapshot is exactly the manifest item set -----------------
  if (!existsSync(UPSTREAM_DIR)) {
    fail('vendor/upstream/ is missing: the upstream snapshot is not preserved')
  } else {
    const onDisk = (await listFiles(UPSTREAM_DIR)).map((file) =>
      relative(UPSTREAM_DIR, file).split(sep).join('/'),
    )
    for (const path of onDisk) {
      if (!byPath.has(path)) fail(`vendor/upstream/${path} is not accounted for in the manifest`)
    }
    for (const path of byPath.keys()) {
      if (!onDisk.includes(path)) fail(`manifest lists ${path} but vendor/upstream/${path} is missing`)
    }
    pass(`vendored snapshot: ${onDisk.length} files, all accounted for`)
  }

  // --- 2. hashes and sizes ---------------------------------------------------
  let hashed = 0
  for (const item of items) {
    const file = join(UPSTREAM_DIR, item.path)
    if (!existsSync(file)) continue
    const digest = await sha256(file)
    if (digest !== item.sha256) {
      fail(`sha256 mismatch for vendor/upstream/${item.path}\n  manifest ${item.sha256}\n  on disk  ${digest}`)
      continue
    }
    const size = (await stat(file)).size
    if (size !== item.bytes) {
      fail(`size mismatch for vendor/upstream/${item.path}: manifest ${item.bytes}, on disk ${size}`)
      continue
    }
    hashed += 1
  }
  pass(`hashes verified: ${hashed}/${items.length}`)

  // --- 3. declared targets exist --------------------------------------------
  let targets = 0
  for (const item of items) {
    for (const target of item.targets ?? []) {
      if (!existsSync(join(ROOT, target))) {
        fail(`target for ${item.path} does not exist: ${target}`)
      } else {
        targets += 1
      }
    }
  }
  pass(`targets present: ${targets}`)

  // --- 4. executable items are byte-identical in assets/ ---------------------
  let verbatim = 0
  for (const item of items) {
    if (item.disposition !== 'executable') continue
    const assetPath = item.targets?.find((target) => target.startsWith('assets/'))
    if (!assetPath) {
      fail(`executable item ${item.path} has no assets/ target`)
      continue
    }
    const digest = await sha256(join(ROOT, assetPath))
    if (digest !== item.sha256) {
      fail(`${assetPath} diverged from vendor/upstream/${item.path} (sha256 ${digest})`)
    } else {
      verbatim += 1
    }
  }
  pass(`verbatim runtime copies: ${verbatim}`)

  // --- 5. no unaccounted asset ----------------------------------------------
  // Upstream items claim assets/ through their targets; authored runtime files
  // (written for this port) claim their own path and are hashed here so drift
  // is caught the same way.
  const authoredAssets = (manifest.authored ?? []).filter((entry) => entry.path?.startsWith('assets/'))
  let authoredHashed = 0
  for (const entry of authoredAssets) {
    const file = join(ROOT, entry.path)
    if (!existsSync(file)) {
      fail(`authored asset is missing: ${entry.path}`)
      continue
    }
    if (!entry.sha256) {
      fail(`authored asset ${entry.path} needs a sha256`)
      continue
    }
    const digest = await sha256(file)
    if (digest !== entry.sha256) {
      fail(`sha256 mismatch for ${entry.path}\n  manifest ${entry.sha256}\n  on disk  ${digest}`)
      continue
    }
    const size = (await stat(file)).size
    if (size !== entry.bytes) {
      fail(`size mismatch for ${entry.path}: manifest ${entry.bytes}, on disk ${size}`)
      continue
    }
    authoredHashed += 1
  }
  if (authoredAssets.length) pass(`authored runtime files verified: ${authoredHashed}/${authoredAssets.length}`)

  if (existsSync(ASSETS_DIR)) {
    const accounted = new Set([
      ...items.flatMap((item) => (item.targets ?? []).filter((t) => t.startsWith('assets/'))),
      ...authoredAssets.map((entry) => entry.path),
    ])
    for (const file of await listFiles(ASSETS_DIR)) {
      const repoPath = rel(file)
      if (!accounted.has(repoPath)) fail(`${repoPath} exists but no manifest item claims it`)
    }
    pass(`assets/ fully claimed: ${accounted.size}`)
  }

  // --- 6. package, patch and skill body agree --------------------------------
  const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'))
  if (pkg.name !== 'mulqi-reasll') fail(`package.json name must be mulqi-reasll, got ${pkg.name}`)
  if (pkg.version !== '1.0.1') fail(`package.json version must be 1.0.1, got ${pkg.version}`)
  if (!pkg.engines?.dsh) fail('package.json must declare engines.dsh')
  if (!pkg.dsh?.bundle?.patch) fail('package.json must declare dsh.bundle.patch')

  const patchPath = join(ROOT, pkg.dsh?.bundle?.patch ?? '')
  if (!existsSync(patchPath)) {
    fail(`bundle patch not found: ${pkg.dsh?.bundle?.patch}`)
  } else {
    const patch = await readFile(patchPath, 'utf8')
    if (!patch.includes(`name: ${pkg.name}`)) {
      fail(`cordis.patch.yml must load the package itself (name: ${pkg.name})`)
    }
    pass('bundle patch resolves to the package')
  }

  const files = pkg.files ?? []
  for (const required of ['index.js', 'assets/', 'cordis.patch.yml', 'HOWTOUSE.md']) {
    if (!files.includes(required)) fail(`package.json files[] must include ${required}`)
  }
  pass('package files[] covers runtime, assets and docs')

  const skillBody = await readFile(join(ASSETS_DIR, 'SKILL.md'), 'utf8')
  const frontName = /^---\n(?:.*\n)*?name:\s*(\S+)/.exec(skillBody)?.[1]
  const entry = await readFile(join(ROOT, 'index.js'), 'utf8')
  const skillName = /const SKILL_NAME = '([^']+)'/.exec(entry)?.[1]
  if (!frontName) fail('assets/SKILL.md has no frontmatter name')
  if (frontName !== skillName) {
    fail(`skill id mismatch: frontmatter "${frontName}" vs index.js "${skillName}"`)
  }
  pass(`skill id consistent: ${skillName}`)

  // --- 7. cited resources resolve -------------------------------------------
  const linked = [...skillBody.matchAll(/\((references\/[^)]+|templates\/[^)]+)\)/g)].map((m) => m[1])
  const unique = [...new Set(linked)]
  if (unique.length < 8) fail(`expected at least 8 cited resources in SKILL.md, found ${unique.length}`)
  for (const path of unique) {
    if (!existsSync(join(ASSETS_DIR, path))) fail(`SKILL.md cites ${path} but assets/${path} is missing`)
  }
  pass(`cited resources resolve: ${unique.length}`)

  // --- report ---------------------------------------------------------------
  for (const line of checks) console.log(`ok   ${line}`)
  if (failures.length) {
    console.error('')
    for (const line of failures) console.error(`FAIL ${line}`)
    console.error(`\n${failures.length} failure(s)`)
    process.exit(1)
  }
  console.log(`\nmanifest complete: ${items.length} source items, ${targets} targets, no omissions`)
}

await main()