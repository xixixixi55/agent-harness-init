import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { normalizeRelativePath, resolveInside } from './paths.js'

describe('path safety', () => {
  it('normalizes a safe relative path', () => {
    expect(normalizeRelativePath('harness\\verification.md')).toBe('harness/verification.md')
  })

  it('rejects traversal and absolute paths', () => {
    expect(() => normalizeRelativePath('../outside')).toThrow(/escapes/)
    expect(() => normalizeRelativePath(path.resolve('outside'))).toThrow(/relative/)
  })

  it('resolves only inside the selected root', () => {
    const root = path.resolve('SYNTHETIC-root')
    expect(resolveInside(root, 'harness/rules.md')).toBe(path.join(root, 'harness', 'rules.md'))
  })
})
