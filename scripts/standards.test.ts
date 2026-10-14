// The mechanical rules from CODING_STANDARDS.md.
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import * as contract from '../src/contract.ts'

test('the data contract is types only', () => {
  expect(Object.keys(contract)).toEqual([])
})

// ponytail: regex over named imports and exports, not a real module graph; `export { a }`, re-exports and
// `import *` aren't seen. Switch to knip if they show up. Imports from tests count as use.
test('every export is imported somewhere', () => {
  const root = fileURLToPath(new URL('..', import.meta.url))
  const files = ['src', 'sync'].flatMap(dir => readdirSync(join(root, dir), { recursive: true, encoding: 'utf8' })
    .filter(f => /\.(ts|svelte)$/.test(f)).map(f => join(root, dir, f)))
  const module = (path: string) => path.replace(/\.ts$/, '')
  // "<module path>#<name>" for every named import of a local module
  const imported = new Set(files.flatMap(f => [...readFileSync(f, 'utf8').matchAll(/import\s+(?:type\s+)?(?:\w+\s*,\s*)?\{([^}]*)\}\s*from\s*'(\.[^']+)'/g)]
    .flatMap(([, names, from]) => names.split(',').map(n => `${module(resolve(dirname(f), from))}#${n.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]}`))))
  const unused = files.flatMap(f => [...readFileSync(f, 'utf8').matchAll(/^\s*export (?:declare )?(?:async )?(?:abstract )?(?:const|let|function|type|interface|class|enum) (\w+)/gm)]
    .map(([, name]) => `${module(f)}#${name}`).filter(id => !imported.has(id)).map(id => relative(root, id)))
  expect(unused).toEqual([])
})
