// Minimal front-matter parser for post content.
// Deliberately not YAML: just `key: value` lines between two `---` delimiters,
// so it works in the browser with no Buffer/Node polyfills.
//
//   ---
//   title: Play Billing upgrades without tears
//   modified: 2026-08-20
//   note: Updated after shipping the second round of plan changes.
//   ---
//   body in markdown...
//
// Posts without a leading `---` line have no front-matter: the whole string is the body.
export function parseFrontMatter(content) {
  const raw = content ?? ''

  if (!raw.startsWith('---\n') && raw !== '---') {
    return { meta: {}, body: raw }
  }

  const lines = raw.split('\n')
  const closingIndex = lines.findIndex((line, index) => index > 0 && line.trim() === '---')

  if (closingIndex === -1) {
    return { meta: {}, body: raw }
  }

  const meta = {}
  for (const line of lines.slice(1, closingIndex)) {
    const separatorIndex = line.indexOf(':')
    if (separatorIndex === -1) continue
    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    if (key) meta[key] = value
  }

  const body = lines.slice(closingIndex + 1).join('\n').trimStart()
  return { meta, body }
}
