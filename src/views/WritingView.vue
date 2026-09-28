<template>
  <AppShell title-bar-text="Command Prompt — lisandro\writing">
    <div class="header">
      <div class="prompt-line">
        C:\lisandro&gt; cd writing
      </div>
      <AppNav active-section="writing" />
    </div>

    <div class="page-heading">
      <h1>Writing</h1>
      <div class="page-subtitle">
        Notes, essays and annotations. Grouped by topic, newest first.
      </div>
    </div>

    <div
      v-if="!config.posts.enabled"
      class="empty-state"
    >
      Writing isn't available in this deployment.
    </div>
    <div
      v-else-if="postsStore.loading"
      class="empty-state"
    >
      Loading&hellip;
    </div>
    <div
      v-else-if="!sections.length"
      class="empty-state"
    >
      Nothing published yet.
    </div>

    <template v-else>
      <div class="jump-to">
        <span class="jump-label">jump to:</span>
        <a
          v-for="section in sections"
          :key="section.section"
          :href="`#${anchorFor(section.section)}`"
        >
          {{ section.section }} ({{ section.posts.length }})
        </a>
      </div>

      <div class="sections-grid">
        <section
          v-for="section in sections"
          :id="anchorFor(section.section)"
          :key="section.section"
          class="category"
        >
          <div class="section-label">
            &gt; {{ section.section }}
          </div>
          <div
            v-for="post in section.posts"
            :key="postId(post)"
            class="post-row"
          >
            <span class="post-date">{{ formatDate(post.createdAt) }}</span>
            <RouterLink :to="`/writing/${postId(post)}`">
              {{ postTitle(post) }}
            </RouterLink>
          </div>
        </section>
      </div>
    </template>

    <div class="footer-prompt">
      <span class="prompt-label">C:\lisandro\writing&gt;</span>
      <span class="cursor" />
    </div>
  </AppShell>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AppShell from '@/components/shell/AppShell.vue'
import AppNav from '@/components/shell/AppNav.vue'
import { usePostsStore } from '@/stores/posts'
import config from '@/config/env'
import { groupPostsByCategory, postId, postTitle } from '@/utils/writingSlug'

const postsStore = usePostsStore()

onMounted(() => {
  if (config.posts.enabled) postsStore.fetchPosts()
})

const sections = computed(() => groupPostsByCategory(postsStore.posts))

function anchorFor(section) {
  return section.toLowerCase().replace(/\s+/g, '-')
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toISOString().slice(0, 10)
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

.jump-to {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 22px;
  padding: 10px 0;
  border-top: 1px dashed var(--f0-rule);
  border-bottom: 1px dashed var(--f0-rule);
  font-size: 16px;
}

.jump-label {
  color: var(--f0-muted);
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 40px 56px;
}

.category {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  color: var(--f0-accent);
  font-weight: 700;
}

.post-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 20px;
  align-items: baseline;
}

.post-date {
  color: var(--f0-muted);
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
  .sections-grid {
    grid-template-columns: 1fr;
  }
}
</style>
