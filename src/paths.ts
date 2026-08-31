import path from 'node:path'

export function normalizeRelativePath(value: string): string {
  const normalized = value.replaceAll('\\', '/').replace(/^\.\//, '')
  if (!normalized || normalized === '.' || path.isAbsolute(value)) {
    throw new Error(`Path must be a non-empty relative path: ${value}`)
  }
  const segments = normalized.split('/')
  if (segments.some((segment) => segment === '..' || segment === '')) {
    throw new Error(`Path escapes or is malformed: ${value}`)
  }
  return segments.join('/')
}

export function resolveInside(root: string, relativePath: string): string {
  const normalized = normalizeRelativePath(relativePath)
  const resolvedRoot = path.resolve(root)
  const resolved = path.resolve(resolvedRoot, ...normalized.split('/'))
  if (!resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Resolved path escapes target root: ${relativePath}`)
  }
  return resolved
}
