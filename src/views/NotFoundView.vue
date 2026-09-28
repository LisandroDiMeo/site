<template>
  <AppShell title-bar-text="Command Prompt — lisandro">
    <div class="header">
      <div class="prompt-line">
        C:\lisandro&gt; {{ $route.path }}
      </div>
      <AppNav />
    </div>

    <div class="error">
      <div class="error-code">
        404
      </div>
      <p>'{{ $route.path }}' is not recognized as an internal or external command.</p>
      <RouterLink to="/">
        &larr; cd \
      </RouterLink>
    </div>
  </AppShell>
</template>

<script setup>
import AppShell from '@/components/shell/AppShell.vue'
import AppNav from '@/components/shell/AppNav.vue'
</script>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.prompt-line {
  color: var(--f0-muted);
  font-size: var(--fs-meta);
}

.error {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.error-code {
  font-size: var(--fs-h1);
  font-weight: 700;
  color: var(--f0-strong);
}
</style>
