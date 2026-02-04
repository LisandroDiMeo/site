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

  // Environment helpers
  isLocal: import.meta.env.VITE_DEPLOYMENT_TYPE === 'local',
  isCloud: import.meta.env.VITE_DEPLOYMENT_TYPE === 'cloud',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,

  // Photo handling
  getPhotoUrl: (photoPath) => {
    // If external photo URL is configured, use that
    if (config.externalPhotosUrl) {
      return `${config.externalPhotosUrl}/${photoPath}`
    }
    
    if (config.isCloud || config.photosMode === 'static') {
      // For cloud deployment, photos are served as static assets
      return `${config.localPhotosPath}/${photoPath}`
    } else {
      // For local deployment, photos might be served from API or local filesystem
      return config.apiBaseUrl ? 
        `${config.apiBaseUrl}${config.localPhotosPath}/${photoPath}` :
        `${config.localPhotosPath}/${photoPath}`
    }
  },

  // Posts API endpoints (placeholder for future backend)
  posts: {
    enabled: !!config.apiBaseUrl,
    baseUrl: config.apiBaseUrl ? `${config.apiBaseUrl}/posts` : null
  }
}

export default config