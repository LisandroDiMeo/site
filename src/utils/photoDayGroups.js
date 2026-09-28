// Groups a node's file_details by the calendar day they were modified, since
// photo-index.json has no pre-computed "day"/"place" of its own. Each photo
// keeps its index within the flattened, day-ordered list so the lightbox can
// show "n / total" and navigate across day boundaries.
export function groupPhotosByDay(fileDetails) {
  const byDay = new Map()

  for (const photo of fileDetails) {
    const dayKey = (photo.modified || photo.created || '').slice(0, 10)
    if (!byDay.has(dayKey)) byDay.set(dayKey, [])
    byDay.get(dayKey).push(photo)
  }

  const dayKeys = Array.from(byDay.keys()).sort()

  let index = 0
  const groups = []
  const flat = []

  for (const dayKey of dayKeys) {
    const label = formatDayLabel(dayKey)
    const photos = byDay.get(dayKey).map((photo) => {
      const entry = { ...photo, index, dayLabel: label }
      index += 1
      flat.push(entry)
      return entry
    })
    groups.push({ dayKey, label, photos })
  }

  return { groups, flat }
}

function formatDayLabel(dayKey) {
  if (!dayKey) return 'Unknown date'
  const date = new Date(`${dayKey}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dayKey
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}
