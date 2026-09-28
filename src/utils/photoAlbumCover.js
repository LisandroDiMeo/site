const cache = new WeakMap()

// Depth-first walk of a photo-index.json node collecting up to `max` photos
// (with their full relative path) to build a 2x2 album cover mosaic. Direct
// photos are preferred; subdirectories are walked in the order they appear
// in the index (already alphabetical from generate-photo-directory.py).
export function collectFirstPhotos(node, max = 4) {
  if (!node) return []
  if (cache.has(node)) return cache.get(node)

  const found = []

  const walk = (current, prefix) => {
    if (found.length >= max) return

    for (const file of current.file_details || []) {
      if (found.length >= max) return
      found.push({ ...file, path: prefix ? `${prefix}/${file.name}` : file.name })
    }

    for (const dirName of current.subdirs || []) {
      if (found.length >= max) return
      const child = current.children?.[dirName]
      if (child) walk(child, prefix ? `${prefix}/${dirName}` : dirName)
    }
  }

  walk(node, '')

  cache.set(node, found)
  return found
}

// Cheap approximation of an album's most recent activity: the latest
// `modified` timestamp among its cover photos (not a full-tree scan).
export function coverDateLabel(coverPhotos) {
  const timestamps = coverPhotos
    .map((photo) => photo.modified || photo.created)
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))

  if (timestamps.length === 0) return null

  const latest = new Date(Math.max(...timestamps.map((d) => d.getTime())))
  return latest.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' }).split('/').reverse().join('-')
}
