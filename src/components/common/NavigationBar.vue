<template>
  <div class="nav-bar">
    <span class="back-link" @click="$emit('back')">
      ← go back
    </span>
  </div>
</template>

<script>
export default {
  name: 'NavigationBar'
}
</script>

<style scoped>
.nav-bar {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  align-items: center;
}

.back-link {
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  transition: var(--transition-fast);
}

.back-link:hover {
  color: var(--color-primary-light);
}
</style>