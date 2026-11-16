<template>
  <nav class="app-nav">
    <RouterLink
      v-for="item in items"
      :key="item.section"
      :to="item.to"
      class="app-nav-link"
      :class="{ 'is-active': activeSection === item.section }"
    >
      [{{ item.label }}]
    </RouterLink>
  </nav>
</template>

<script setup>
defineProps({
  activeSection: {
    type: String,
    default: ''
  }
})

const items = [
  { section: 'home', label: 'inicio', to: '/' },
  { section: 'writing', label: 'escritos', to: '/writing' },
  { section: 'projects', label: 'proyectos', to: '/projects' },
  { section: 'photos', label: 'fotos', to: '/photos' },
  { section: 'hello', label: 'hola', to: '/hello' }
]
</script>

<style scoped>
.app-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
}

.app-nav-link {
  color: var(--f0-text);
  border-bottom-color: var(--f0-rule);
}

.app-nav-link.is-active {
  color: var(--f0-accent);
  border-bottom-color: var(--f0-accent);
}
</style>
