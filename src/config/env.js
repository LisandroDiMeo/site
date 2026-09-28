export const config = {
  // App configuration
  appTitle: import.meta.env.VITE_APP_TITLE || "Lisandro's Site",
  deploymentType: import.meta.env.VITE_DEPLOYMENT_TYPE || 'local',
  baseUrl: import.meta.env.VITE_BASE_URL || '/',

  // API configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090',

  // Photo configuration
  photosMode: import.meta.env.VITE_PHOTOS_MODE || 'filesystem',
  localPhotosPath: import.meta.env.VITE_LOCAL_PHOTOS_PATH || '/assets/photos',
  externalPhotosUrl: import.meta.env.VITE_EXTERNAL_PHOTOS_URL,

  // Writing configuration: the NAS folder holding the vault's .md files and writing-index.json
  externalWritingUrl: (import.meta.env.VITE_EXTERNAL_WRITING_URL || '').replace(/\/$/, ''),

  // Environment helpers
  isLocal: import.meta.env.VITE_DEPLOYMENT_TYPE === 'local',
  isCloud: import.meta.env.VITE_DEPLOYMENT_TYPE === 'cloud',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,

  // Photo handling
  getPhotoUrl: (photoPath) => {
    if (config.externalPhotosUrl) {
      return `${config.externalPhotosUrl}/${photoPath}`
    }
    return `${config.localPhotosPath}/${photoPath}`
  },

  // Writing handling: each path segment is encoded (vault names contain spaces and accents)
  getWritingUrl: (writingPath) =>
    `${config.externalWritingUrl}/${writingPath.split('/').map(encodeURIComponent).join('/')}`
}

export default config