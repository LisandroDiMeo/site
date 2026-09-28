import { ref, onMounted } from 'vue'
import { writingService } from '@/services/writing.service'

// Loads writing-index.json from the NAS. `configured` is false when
// VITE_EXTERNAL_WRITING_URL is unset, so views can show a proper empty state.
export function useWritingManifest() {
  const manifest = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const configured = writingService.isConfigured()

  async function load() {
    if (!configured) {
      loading.value = false
      return
    }
    loading.value = true
    error.value = null
    try {
      manifest.value = await writingService.fetchManifest()
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  return { manifest, loading, error, configured, reload: load }
}
