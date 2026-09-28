<template>
  <AppShell :title-bar-text="titleBarText">
    <div class="header">
      <div class="prompt-line">
        {{ promptLine }}
      </div>
      <AppNav active-section="writing" />
    </div>

    <template v-if="resolved?.type === 'article'">
      <WritingArticle
        :entry="resolved.entry"
        :dir="resolved.dir"
      />
    </template>

    <template v-else>
      <div class="page-heading">
        <RouterLink
          v-if="pathSegments.length"
          :to="parentRoute"
          class="up-link"
        >
          &larr; cd ..
        </RouterLink>
        <h1>{{ heading }}</h1>
        <div
          v-if="!pathSegments.length"
          class="page-subtitle"
        >
          Notes, essays and annotations. Folders first, newest first.
        </div>
      </div>

      <div
        v-if="!configured"
        class="empty-state"
      >
        Writing isn't available in this deployment.
      </div>
      <div
        v-else-if="loading"
        class="empty-state"
      >
        Loading&hellip;
      </div>
      <div
        v-else-if="error"
        class="empty-state"
      >
        Couldn't load the writing index.
      </div>
      <div
        v-else-if="!resolved"
        class="empty-state"
      >
        Directory not found.
      </div>
      <div
        v-else-if="!resolved.node.subdirs.length && !resolved.node.file_details.length"
        class="empty-state"
      >
        Nothing published yet.
      </div>

      <div
        v-else
        class="entries"
      >
        <div
          v-for="dir in resolved.node.subdirs"
          :key="dir"
          class="entry-row"
        >
          <span class="entry-count">{{ resolved.node.children[dir].total_articles }} notes</span>
          <RouterLink :to="folderRoute(childPath(dir))">
            {{ dir }}/
          </RouterLink>
        </div>
        <div
          v-for="entry in files"
          :key="entry.path"
          class="entry-row"
        >
          <span class="entry-date">{{ formatDate(entry.date) }}</span>
          <span>
            <RouterLink :to="articleRoute(entry)">{{ entry.title }}</RouterLink>
            <span
              v-if="entry.tags.length"
              class="entry-tags"
            >{{ entry.tags.map((tag) => `#${tag}`).join(' ') }}</span>
          </span>
        </div>
      </div>
    </template>

    <div class="footer-prompt">
      <span class="prompt-label">C:\lisandro\writing&gt;</span>
      <span class="cursor" />
    </div>
  </AppShell>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/shell/AppShell.vue'
import AppNav from '@/components/shell/AppNav.vue'
import WritingArticle from '@/components/writing/WritingArticle.vue'
import { useWritingManifest } from '@/composables/useWritingManifest'
import {
  articleRoute,
  folderRoute,
  formatDate,
  pathFromRoute,
  resolveWritingPath,
  sortByDateDesc
} from '@/utils/writingTree'

const route = useRoute()
const { manifest, loading, error, configured } = useWritingManifest()

const currentPath = computed(() => pathFromRoute(route.params.pathMatch))
const pathSegments = computed(() => currentPath.value.split('/').filter(Boolean))
const resolved = computed(() => resolveWritingPath(manifest.value, currentPath.value))

const files = computed(() => sortByDateDesc(resolved.value?.node?.file_details || []))

const heading = computed(() => pathSegments.value.at(-1) || 'Writing')
const parentRoute = computed(() => folderRoute(pathSegments.value.slice(0, -1).join('/')))

const promptLine = computed(() => {
  if (!pathSegments.value.length) return 'C:\\lisandro> cd writing'
  const dirs = resolved.value?.type === 'article' ? pathSegments.value.slice(0, -1) : pathSegments.value
  const prefix = ['C:\\lisandro\\writing', ...dirs].join('\\')
  return resolved.value?.type === 'article'
    ? `${prefix}> type ${pathSegments.value.at(-1)}`
    : `${prefix}> dir`
})
const titleBarText = computed(() =>
  ['Command Prompt — lisandro\\writing', ...pathSegments.value].join('\\')
)

const childPath = (dir) => (currentPath.value ? `${currentPath.value}/${dir}` : dir)
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

.up-link {
  color: var(--f0-muted);
  font-size: var(--fs-meta);
}

.entries {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  color: var(--f0-accent);
  font-weight: 700;
}

.entry-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 20px;
  align-items: baseline;
}

.entry-date,
.entry-count {
  color: var(--f0-muted);
}

.entry-tags {
  margin-left: 12px;
  color: var(--f0-muted);
  font-size: var(--fs-meta);
}

.footer-prompt {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

.prompt-label {
  color: var(--f0-muted);
}

.cursor {
  display: inline-block;
  width: 10px;
  height: 19px;
  background: var(--f0-text);
}

@media (max-width: 768px) {
  .entry-row {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
</style>
