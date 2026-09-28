// Helpers over the writing-index.json tree (same node shape as photo-index.json,
// with `file_details` entries describing each .md article).

const MD_EXTENSION = /\.md$/i

export function pathFromRoute(param) {
  return Array.isArray(param) ? param.join('/') : param || ''
}

// `/writing/<path without .md>` — router encodes the segments.
export function articleRoute(entry) {
  return `/writing/${entry.path.replace(MD_EXTENSION, '')}`
}

export function folderRoute(dirPath) {
  return dirPath ? `/writing/${dirPath}` : '/writing'
}

function dirNode(manifest, segments) {
  let node = manifest
  for (const segment of segments) {
    node = node?.children?.[segment]
    if (!node) return null
  }
  return node
}

// A route path is either a folder or an article (its file name without `.md`).
// Returns { type: 'dir', node } | { type: 'article', entry, dir } | null.
export function resolveWritingPath(manifest, path) {
  if (!manifest) return null
  const segments = path.split('/').filter(Boolean)

  const asDir = dirNode(manifest, segments)
  if (asDir) return { type: 'dir', node: asDir }

  const parent = dirNode(manifest, segments.slice(0, -1))
  const last = segments.at(-1)
  const entry = parent?.file_details.find((file) => file.name.replace(MD_EXTENSION, '') === last)
  return entry ? { type: 'article', entry, dir: parent } : null
}

export function sortByDateDesc(entries) {
  return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function flattenArticles(node) {
  return [
    ...node.file_details,
    ...Object.values(node.children).flatMap(flattenArticles)
  ]
}

export function recentArticles(manifest, limit) {
  return manifest ? sortByDateDesc(flattenArticles(manifest)).slice(0, limit) : []
}

// The next-older article in the same folder, or undefined.
export function previousInDir(dir, entry) {
  const sorted = sortByDateDesc(dir.file_details)
  const index = sorted.findIndex((file) => file.path === entry.path)
  return index >= 0 ? sorted[index + 1] : undefined
}

export function formatDate(dateString, length = 10) {
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, length)
}
