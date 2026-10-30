/**
 * Mulqi ReaSLL — DSH skill provider for the "reverse-engineer-anything
 * self-learning loop" skill, ported from
 * https://github.com/Speedrunlab/reverse-engineer-anything-self-learning-loop
 * (MIT, Speedrun AI Labs, commit a0b4f1e).
 *
 * The instruction body and its references/templates are shipped verbatim under
 * assets/; vendor/upstream/ keeps the complete upstream snapshot read-only.
 * This module only registers the skill with `ctx.skills` so the agent can load
 * it on demand. It adds no tools and overrides no host instruction.
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

/** Provider name inside the `ctx.skills` registry. */
const PROVIDER_NAME = 'reasll'

/** Kebab-case skill id the agent addresses through the `skill` tool. */
const SKILL_NAME = 'reverse-engineer-anything-self-learning-loop'

/** Directory every relative path in the skill body resolves against. */
const RESOURCE_BASE = {
  kind: 'directory',
  path: fileURLToPath(new URL('./assets/', import.meta.url)),
}

/** Body file shipped with this package. */
const SKILL_BODY_URL = new URL('./assets/SKILL.md', import.meta.url)

/** `BUNDLED_SKILL_RANK` from @deepseek-ai/dsh-skill: lower ranks win name collisions. */
const BUNDLED_SKILL_RANK = 600

/** Routing description carried over from the source skill frontmatter. */
const DESCRIPTION =
  'Reverse Engineer Anything with a Self-Learning Loop: examine software you are authorised to analyse, build your own working equivalent, then review it against the original with evidence, plan the gaps, improve, and repeat until a written definition of 100% is met, learning from every iteration so the next product starts further along. Use for: rebuilding a product whose source is lost, a compatible replacement for a tool you license, a port to a new platform, finishing a reconstruction that stalled at 80%. Static-first, evidence-led, authorisation-gated; it builds its own design and never copies protected expression.'

/**
 * Metadata carried over from the source skill frontmatter.
 *
 * `version` stays at the upstream skill release so the provenance of the
 * instructions is unambiguous; `plugin` identifies this packaging instead.
 */
const METADATA = {
  version: '1.0.1',
  author: 'Speedrun AI Labs',
  license: 'MIT',
  tags: ['reverse-engineering', 'reconstruction', 'self-improvement', 'learning-loop'],
  companions: [
    'reverse-engineer-anything',
    'hermes-agent-as-a-skill-file',
  ],
  upstream:
    'https://github.com/Speedrunlab/reverse-engineer-anything-self-learning-loop',
  upstreamCommit: 'a0b4f1ecff591100d207ddcc799bcb5bb769f031',
  plugin: {
    name: 'mulqi-reasll',
    displayName: 'Mulqi ReaSLL',
    version: '1.0.0',
  },
}

const INVOCATION = { modelInvocable: true, userInvocable: true }

const CANDIDATE = {
  name: SKILL_NAME,
  description: DESCRIPTION,
  invocation: INVOCATION,
  provider: PROVIDER_NAME,
  source: 'bundled',
  resourceBase: RESOURCE_BASE,
  rank: BUNDLED_SKILL_RANK,
  locator: {},
  metadata: METADATA,
}

/**
 * Drop the leading YAML frontmatter block. The metadata it carried is supplied
 * programmatically in `METADATA`, so the body the model reads stays prose-only.
 * @param {string} raw - file contents.
 * @returns {string} markdown body.
 */
function stripFrontmatter(raw) {
  if (!raw.startsWith('---')) return raw
  const end = raw.indexOf('\n---', 3)
  if (end === -1) return raw
  const after = raw.indexOf('\n', end + 4)
  return after === -1 ? '' : raw.slice(after + 1).trimStart()
}

let cachedBody

/** Read the shipped body once per process. */
async function loadBody() {
  cachedBody ??= stripFrontmatter(await readFile(SKILL_BODY_URL, 'utf8'))
  return cachedBody
}

/** @type {import('@deepseek-ai/dsh-skill').SkillProvider} */
const provider = {
  name: PROVIDER_NAME,
  async list() {
    return [CANDIDATE]
  },
  async get(candidate, options) {
    options?.signal?.throwIfAborted?.()
    if (candidate.name !== SKILL_NAME) return undefined
    return {
      name: SKILL_NAME,
      description: DESCRIPTION,
      invocation: INVOCATION,
      provider: PROVIDER_NAME,
      source: 'bundled',
      resourceBase: RESOURCE_BASE,
      metadata: METADATA,
      content: await loadBody(),
    }
  },
}

/** Cordis plugin name. */
export const name = 'reasll'

/** Service this plugin needs before it can register. */
export const inject = ['skills']

/**
 * Register the bundled skill provider.
 * @param {import('@deepseek-ai/cordis').Context} ctx - cordis context.
 */
export function apply(ctx) {
  ctx.skills.registerProvider(() => provider)
}
