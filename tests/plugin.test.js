/**
 * Integration test against the real DSH skill registry.
 * Resolves @deepseek-ai/cordis and @deepseek-ai/dsh-skill from a DSH checkout
 * instead of adding them as dependencies, so the published package stays
 * dependency-free.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const DSH_ROOT = process.env.DSH_ROOT ?? '/home/administrator/deepseek-harness'

// Resolve from a workspace package that actually depends on both modules.
const requireFromDsh = createRequire(`${DSH_ROOT}/packages/skill/skill/package.json`)
const load = (specifier) => {
  const resolved = requireFromDsh.resolve(specifier)
  return import(pathToFileURL(resolved).href)
}

const SKILL = 'reverse-engineer-anything-self-learning-loop'

test('plugin registers one bundled skill on the real registry', async (t) => {
  if (!existsSync(DSH_ROOT)) {
    t.skip(`DSH checkout not found at ${DSH_ROOT}`)
    return
  }

  const { Context } = await load('@deepseek-ai/cordis')
  const { default: SkillRegistry } = await load('@deepseek-ai/dsh-skill')
  const plugin = await import(pathToFileURL(new URL('../index.js', import.meta.url).pathname).href)

  const ctx = new Context()
  await ctx.plugin(SkillRegistry)
  const fiber = await ctx.plugin(plugin)

  const summaries = await ctx.skills.list()
  assert.equal(summaries.length, 1)
  const summary = summaries[0]
  assert.equal(summary.name, SKILL)
  assert.equal(summary.provider, 'reasll')
  assert.equal(summary.source, 'bundled')
  assert.deepEqual(summary.invocation, { modelInvocable: true, userInvocable: true })
  assert.equal(summary.resourceBase.kind, 'directory')
  assert.ok(summary.description.startsWith('Reverse Engineer Anything with a Self-Learning Loop'))

  const definition = await ctx.skills.get(SKILL)
  assert.ok(definition, 'skill body must load')
  assert.equal(definition.metadata.upstream,
    'https://github.com/Speedrunlab/reverse-engineer-anything-self-learning-loop')
  assert.ok(definition.content.length > 5000, 'body must keep the full instructions')
  assert.ok(!definition.content.startsWith('---'), 'frontmatter must be stripped from the body')
  assert.match(definition.content, /^# /, 'body must open with its title heading')
  assert.match(definition.content, /^# /m, 'body keeps its headings')

  // Every relative path the body cites must exist beside the body.
  const linked = [...definition.content.matchAll(/\((references\/[^)]+|templates\/[^)]+)\)/g)]
    .map((m) => m[1])
  assert.ok(linked.length >= 8, `expected cited resources, got ${linked.length}`)
  for (const rel of linked) {
    const file = new URL(`../assets/${rel}`, import.meta.url)
    await assert.doesNotReject(readFile(file), `missing cited resource: ${rel}`)
  }

  await fiber.dispose()
  assert.deepEqual(await ctx.skills.list(), [], 'provider must unregister on dispose')
})
