// Global image cache manager to prevent reloading images

class ImageCacheError extends Error {
    constructor(code, message) {
        super(message)
        this.name = 'ImageCacheError'
        this.code = code
    }
}

class ImageCacheManager {
    constructor() {
        this.cache = new Map()
        this.loadingQueue = []
        this.activeDownloads = 0
        this.maxConcurrentDownloads = 3
        this.observers = new Map()
        this.epoch = 0
    }

    getCacheKey(path, options = {}) {
        const quality = options.quality ?? 1
        return `${path}::q${quality}`
    }

    // Subscribe to image load events
    subscribe(path, callback, options = {}) {
        const key = this.getCacheKey(path, options)
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

    unsubscribe(path, callback, options = {}) {
        const key = this.getCacheKey(path, options)
        const callbacks = this.observers.get(key)
        if (callbacks) {
            callbacks.delete(callback)
            if (callbacks.size === 0) {
                this.observers.delete(key)
            }
        }
    }

    notify(path, data, options = {}) {
        const key = this.getCacheKey(path, options)
        const callbacks = this.observers.get(key)
        if (callbacks) {
            callbacks.forEach(callback => callback(data))
        }
    }

    async loadImage(path, options = {}) {
        const key = this.getCacheKey(path, options)

        // Check if already cached
        const cached = this.cache.get(key)
        if (cached && cached.status === 'loaded') {
            return cached.url
        }

        // Check if already loading
        if (cached && cached.status === 'loading' && !cached.cancelled) {
            return cached.promise
        }

        // Add to cache as loading
        const currentEpoch = this.epoch
        const imageData = {
            status: 'loading',
            url: null,
            error: null,
            promise: null,
            originalPath: path,
            options,
            cancelled: false,
            epoch: currentEpoch
        }

        const loadPromise = this.queueImageLoad(path, options, imageData)
        imageData.promise = loadPromise

        this.cache.set(key, imageData)
        this.notify(path, { status: 'loading' }, options)

        try {
            const url = await loadPromise
            // Discard stale results from a load that was cancelled/superseded
            // (e.g. by clearAll()) while the request was still in flight.
            if (imageData.cancelled || imageData.epoch !== this.epoch || this.cache.get(key) !== imageData) {
                if (url && url.startsWith('blob:')) URL.revokeObjectURL(url)
                return url
            }
            imageData.status = 'loaded'
            imageData.url = url
            this.notify(path, { status: 'loaded', url }, options)
            return url
        } catch (error) {
            if (imageData.cancelled || imageData.epoch !== this.epoch || this.cache.get(key) !== imageData) {
                return
            }
            imageData.status = 'error'
            imageData.error = error
            this.notify(path, { status: 'error', error }, options)
            throw error
        }
    }

    async queueImageLoad(path, options, imageData) {
        return new Promise((resolve, reject) => {
            const task = { path, options, imageData, resolve, reject }
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
        const maxRetries = options.retries ?? 2
        let lastError = null

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const url = await this._attemptDownload(path, options)
                return url
            } catch (err) {
                lastError = err
                // Resize/canvas failures are deterministic within an attempt (and already
                // have a graceful fallback in _attemptDownload) — retrying identically won't help.
                if (err.code && err.code.startsWith('RESIZE_')) {
                    throw err
                }
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)))
                }
            }
        }

        throw lastError
    }

    async _attemptDownload(path, options = {}) {
        return new Promise((resolve, reject) => {
            const img = new Image()

            // Create a lower quality version by using canvas (if supported)
            img.onload = () => {
                if (options.quality && options.quality < 1) {
                    this.resizeImage(img, options.quality)
                        .then(resolve)
                        .catch((err) => {
                            console.warn('Thumbnail resize failed, falling back to original image:', err.message)
                            resolve(path) // Fallback to original
                        })
                } else {
                    resolve(path)
                }
            }

            img.onerror = () => {
                reject(new ImageCacheError('IMG_LOAD_ERROR', `Failed to load image: ${path}`))
            }

            // Add crossOrigin if needed for canvas operations
            if (options.quality && options.quality < 1) {
                img.crossOrigin = 'anonymous'
            }

            img.src = path
        })
    }

    async resizeImage(img, quality = 0.7) {
        return new Promise((resolve, reject) => {
            try {
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
                        if (!blob) {
                            reject(new ImageCacheError('RESIZE_TAINTED_CANVAS', 'Canvas is tainted (likely CORS) or blob generation failed'))
                            return
                        }
                        try {
                            resolve(URL.createObjectURL(blob))
                        } catch (err) {
                            reject(new ImageCacheError('RESIZE_BLOB_URL_FAILED', err.message))
                        }
                    },
                    'image/jpeg',
                    quality
                )
            } catch (err) {
                // drawImage throws synchronously if the canvas is already tainted
                reject(new ImageCacheError('RESIZE_SECURITY_ERROR', err.message))
            }
        })
    }

    // Retry all images that failed to load
    retryErrors() {
        const errorEntries = []
        this.cache.forEach((imageData, key) => {
            if (imageData.status === 'error') {
                errorEntries.push({ key, path: imageData.originalPath, options: imageData.options })
            }
        })

        for (const entry of errorEntries) {
            this.cache.delete(entry.key)
            this.loadImage(entry.path, entry.options)
        }

        return errorEntries.length
    }

    // Cancel a queued or in-flight load (e.g. when its component unmounts)
    cancel(path, options = {}) {
        const key = this.getCacheKey(path, options)
        const cached = this.cache.get(key)
        if (!cached) return

        cached.cancelled = true
        if (cached.status === 'loading') {
            const idx = this.loadingQueue.findIndex(t => t.imageData === cached)
            if (idx !== -1) {
                this.loadingQueue.splice(idx, 1)
            }
            // If already downloading, a plain <img> network request can't be aborted from JS.
            // We let it finish naturally; the `cancelled` flag discards its result and
            // activeDownloads still decrements normally via processQueue's existing finally().
        }

        this.cache.delete(key)
        this.observers.delete(key)
    }

    // Clear specific image from cache
    clearImage(path, options = {}) {
        const key = this.getCacheKey(path, options)
        const cached = this.cache.get(key)

        if (cached && cached.url && cached.url.startsWith('blob:')) {
            URL.revokeObjectURL(cached.url)
        }

        this.cache.delete(key)
        this.observers.delete(key)
    }

    // Clear all cache
    clearAll() {
        this.epoch++

        // Revoke all blob URLs
        this.cache.forEach((imageData) => {
            imageData.cancelled = true
            if (imageData.status === 'loaded' && imageData.url && imageData.url.startsWith('blob:')) {
                URL.revokeObjectURL(imageData.url)
            }
        })

        // Reject any tasks still sitting in the queue so their promises settle
        // instead of hanging forever; the epoch/identity guard in loadImage()
        // swallows these cleanly.
        const droppedTasks = this.loadingQueue
        this.loadingQueue = []
        droppedTasks.forEach(t => t.reject(new ImageCacheError('CACHE_CLEARED', 'Load cancelled by clearAll()')))

        this.cache.clear()
        this.observers.clear()
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