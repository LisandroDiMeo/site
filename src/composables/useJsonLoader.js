import { ref, onMounted } from 'vue'

export function useJsonLoader(url) {
  const items = ref([])
  const loading = ref(true)
  const error = ref(null)

  const load = async () => {
    try {
      loading.value = true
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to load ${url}`)
      items.value = await response.json()
    } catch (e) {
      error.value = e
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  onMounted(load)
  return { items, loading, error, reload: load }
}
