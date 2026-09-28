<template>
  <AppShell title-bar-text="Command Prompt — lisandro\projects">
    <div class="header">
      <div class="prompt-line">
        C:\lisandro&gt; cd projects
      </div>
      <AppNav active-section="projects" />
    </div>

    <div class="page-heading">
      <h1>Projects</h1>
      <div class="page-subtitle">
        Small things I've built and shipped on my own.
      </div>
    </div>

    <div
      v-if="loading"
      class="empty-state"
    >
      Loading&hellip;
    </div>
    <div
      v-else-if="!sorted.length"
      class="empty-state"
    >
      Nothing here yet.
    </div>

    <div
      v-else
      class="project-list"
    >
      <div
        v-for="item in sorted"
        :key="item.url"
        class="project-row"
      >
        <span class="project-date">{{ formatDate(item.creationDate) }}</span>
        <div class="project-body">
          <a
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="project-title"
          >{{ item.title }}</a>
          <span class="project-description">{{ item.description }}</span>
          <a
            v-if="item.repositoryUrl"
            :href="item.repositoryUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="project-repo"
          >source</a>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { computed } from 'vue'
import AppShell from '@/components/shell/AppShell.vue'
import AppNav from '@/components/shell/AppNav.vue'
import { useJsonLoader } from '@/composables/useJsonLoader'

const { items, loading } = useJsonLoader('/by-me.json')

const sorted = computed(() =>
  [...items.value].sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate))
)

function formatDate(dateString) {
  if (!dateString) return ''
  return dateString
}
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

.page-heading {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-heading h1 {
  margin: 0;
  font-size: var(--fs-h1);
  line-height: 1.1;
  color: var(--f0-strong);
}

.page-subtitle {
  color: var(--f0-muted);
}

.empty-state {
  color: var(--f0-muted);
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 20px;
}

.project-date {
  color: var(--f0-muted);
}

.project-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-title {
  color: var(--f0-strong);
  font-weight: 700;
  border-bottom-color: var(--f0-rule);
  align-self: flex-start;
}

.project-description {
  color: var(--f0-muted);
}

.project-repo {
  align-self: flex-start;
  font-size: var(--fs-meta);
  color: var(--f0-accent);
  border-bottom-color: #a6caf0;
}

@media (max-width: 768px) {
  .project-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
