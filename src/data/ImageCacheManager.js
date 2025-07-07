// Global image cache manager to prevent reloading images
class ImageCacheManager {
    constructor() {
        this.cache = new Map()
        this.loadingQueue = []
        this.activeDownloads = 0
        this.maxConcurrentDownloads = 3
        this.observers = new Map()
    }

    getCacheKey(path) {
        return path
    }

    // Subscribe to image load events
    subscribe(path, callback) {
        const key = this.getCacheKey(path)
        if (!this.observers.has(key)) {
            this.observers.set(key, new Set())
        }
        this.observers.get(key).add(callback)

        // If already cached, call immediately
        const cached = this.cache.get(key)
        if (cached) {
            callback({ status: cached.status, url: cached.url, error: cached.error })
        }
    }

    unsubscribe(path, callback) {
        const key = this.getCacheKey(path)
        const callbacks = this.observers.get(key)
        if (callbacks) {
            callbacks.delete(callback)
            if (callbacks.size === 0) {
                this.observers.delete(key)
            }
        }
    }

    notify(path, data) {
        const key = this.getCacheKey(path)
        const callbacks = this.observers.get(key)
        if (callbacks) {
            callbacks.forEach(callback => callback(data))
        }
    }

    async loadImage(path, options = {}) {
        const key = this.getCacheKey(path)

        // Check if already cached
        const cached = this.cache.get(key)
        if (cached && cached.status === 'loaded') {
            return cached.url
        }

        // Check if already loading
        if (cached && cached.status === 'loading') {
            return cached.promise
        }

        // Add to cache as loading
        const imageData = {
            status: 'loading',
            url: null,
            error: null,
            promise: null
        }

        const loadPromise = this.queueImageLoad(path, options)
        imageData.promise = loadPromise

        this.cache.set(key, imageData)
        this.notify(path, { status: 'loading' })

        try {
            const url = await loadPromise
            imageData.status = 'loaded'
            imageData.url = url
            this.notify(path, { status: 'loaded', url })
            return url
        } catch (error) {
            imageData.status = 'error'
            imageData.error = error
            this.notify(path, { status: 'error', error })
            throw error
        }
    }

    async queueImageLoad(path, options) {
        return new Promise((resolve, reject) => {
            const task = { path, options, resolve, reject }
            this.loadingQueue.push(task)
            this.processQueue()
        })
    }

    async processQueue() {
        while (this.activeDownloads < this.maxConcurrentDownloads && this.loadingQueue.length > 0) {
            const task = this.loadingQueue.shift()
            this.activeDownloads++

            this.downloadImage(task.path, task.options)
                .then(url => {
                    task.resolve(url)
                })
                .catch(error => {
                    task.reject(error)
                })
                .finally(() => {
                    this.activeDownloads--
                    this.processQueue()
                })
        }
    }

    async downloadImage(path, options = {}) {
        return new Promise((resolve, reject) => {
            const img = new Image()

            // Create a lower quality version by using canvas (if supported)
            img.onload = () => {
                if (options.quality && options.quality < 1) {
                    this.resizeImage(img, options.quality)
                        .then(resolve)
                        .catch(() => resolve(path)) // Fallback to original
                } else {
                    resolve(path)
                }
            }

            img.onerror = () => {
                reject(new Error(`Failed to load image: ${path}`))
            }

            // Add crossOrigin if needed for canvas operations
            if (options.quality && options.quality < 1) {
                img.crossOrigin = 'anonymous'
            }

            img.src = path
        })
    }

    async resizeImage(img, quality = 0.7) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            // Calculate new dimensions (max 800px wide/tall for thumbnails)
            const maxSize = 800
            let width = img.width
            let height = img.height

            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = (height / width) * maxSize
                    width = maxSize
                } else {
                    width = (width / height) * maxSize
                    height = maxSize
                }
            }

            canvas.width = width
            canvas.height = height

            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height)

            // Convert to blob with quality setting
            canvas.toBlob(
                (blob) => {
                    const url = URL.createObjectURL(blob)
                    resolve(url)
                },
                'image/jpeg',
                quality
            )
        })
    }

    // Clear specific image from cache
    clearImage(path) {
        const key = this.getCacheKey(path)
        const cached = this.cache.get(key)

        if (cached && cached.url && cached.url.startsWith('blob:')) {
            URL.revokeObjectURL(cached.url)
        }

        this.cache.delete(key)
        this.observers.delete(key)
    }

    // Clear all cache
    clearAll() {
        // Revoke all blob URLs
        this.cache.forEach((imageData) => {
            if (imageData.url && imageData.url.startsWith('blob:')) {
                URL.revokeObjectURL(imageData.url)
            }
        })

        this.cache.clear()
        this.observers.clear()
        this.loadingQueue = []
    }

    // Get cache stats
    getStats() {
        return {
            totalCached: this.cache.size,
            loading: Array.from(this.cache.values()).filter(item => item.status === 'loading').length,
            loaded: Array.from(this.cache.values()).filter(item => item.status === 'loaded').length,
            errors: Array.from(this.cache.values()).filter(item => item.status === 'error').length,
            queueLength: this.loadingQueue.length,
            activeDownloads: this.activeDownloads
        }
    }
}

// Create singleton instance
const imageCache = new ImageCacheManager()

// Export for use in Vue components
export default imageCache