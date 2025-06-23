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
  gap: 4px;
  margin-bottom: 12px;
  align-items: center;
}

.back-link {
  color: #000080;
  text-decoration: underline;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.back-link:hover {
  color: #0000FF;
}
</style>