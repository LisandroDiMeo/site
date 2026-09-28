import config from '@/config/env'

const MANIFEST_NAME = 'writing-index.json'

let manifestPromise = null

async function fetchText(url) {
  const response = await fetch(url, { cache: 'no-cache' })
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${url}`)
  return response
}

export const writingService = {
  isConfigured: () => !!config.externalWritingUrl,

  // The manifest is generated on the NAS by sync-writing.py, so it changes without a
  // deploy. Cached in memory for the lifetime of the page; a failed load can be retried.
  fetchManifest() {
    if (!manifestPromise) {
      manifestPromise = fetchText(config.getWritingUrl(MANIFEST_NAME))
        .then((response) => response.json())
        .catch((error) => {
          manifestPromise = null
          throw error
        })
    }
    return manifestPromise
  },

  async fetchArticle(writingPath) {
    const response = await fetchText(config.getWritingUrl(writingPath))
    return response.text()
  }
}
