<template>
  <AppShell :title-bar-text="titleBarText">
    <div class="header">
      <div class="prompt-line">
        {{ promptLine }}
      </div>
      <AppNav active-section="writing" />
    </div>

    <div
      v-if="!post"
      class="empty-state"
    >
      {{ loading ? 'Loading…' : 'Post not found.' }}
    </div>

    <article
      v-else
      class="article"
    >
      <header class="article-header">
        <h1>{{ article.title.value }}</h1>
        <div class="meta-line">
          <span>{{ formatDate(article.publishedAt.value) }}</span>
          <template v-if="article.modified.value">
            <span>&middot;</span><span>m. {{ article.modified.value }}</span>
          </template>
          <span>&middot;</span><span>by lisandro</span>
          <template v-if="article.tags.value.length">
            <span>&middot;</span>
            <a
              v-for="tag in article.tags.value"
              :key="tag"
              :href="`/writing#${anchorFor(tag)}`"
              class="tag"
            >#{{ tag }}</a>
          </template>
        </div>
        <div
          v-if="article.note.value"
          class="article-note"
        >
          {{ article.note.value }}
        </div>
      </header>

      <!-- eslint-disable-next-line vue/no-v-html -->
      <div
        class="article-body"
        v-html="article.html.value"
      />

      <footer class="article-footer">
        <RouterLink
          v-if="previous"
          :to="`/writing/${postId(previous)}`"
        >
          &larr; {{ postTitle(previous) }}
        </RouterLink>
        <span v-else />
        <RouterLink to="/writing">
          cd ..
        </RouterLink>
      </footer>
    </article>
  </AppShell>
</template>

<script setup>
import { computed, onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/shell/AppShell.vue'
import AppNav from '@/components/shell/AppNav.vue'
import { usePostsStore } from '@/stores/posts'
import config from '@/config/env'
import { useMarkdownArticle } from '@/composables/useMarkdownArticle'
import { findPostById, previousPost, postId, postTitle } from '@/utils/writingSlug'

const route = useRoute()
const postsStore = usePostsStore()
const loading = computed(() => postsStore.loading)

onMounted(() => {
  if (config.posts.enabled && postsStore.posts.length === 0) postsStore.fetchPosts()
})

const post = computed(() => findPostById(postsStore.posts, route.params.id))
const previous = computed(() => (post.value ? previousPost(postsStore.posts, post.value) : undefined))

const article = useMarkdownArticle(post)

const promptLine = computed(() => `C:\\lisandro\\writing\\${article.section.value}> type ${route.params.id}`)
const titleBarText = computed(() => `Command Prompt — type ${route.params.id}`)

watchEffect(() => {
  if (post.value) document.title = article.title.value
})

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

.empty-state {
  color: var(--f0-muted);
}

.article {
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  font-size: var(--fs-article-body);
  line-height: var(--lh-article);
}

.article-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px dashed var(--f0-rule);
}

.article-header h1 {
  margin: 0;
  font-size: var(--fs-article-h1);
  line-height: 1.05;
  color: var(--f0-strong);
}

.meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  font-size: var(--fs-meta);
  color: var(--f0-muted);
}

.tag {
  color: var(--f0-accent);
  border-bottom-color: #a6caf0;
}

.article-note {
  font-style: italic;
  color: #5f5c56;
}

.article-body :deep(p) {
  margin: 0;
}

.article-body :deep(ul),
.article-body :deep(ol) {
  margin: 0;
  padding-left: 22px;
}

.article-body :deep(li) {
  margin: 4px 0;
}

.article-body :deep(li)::marker {
  color: var(--f0-muted);
}

.article-body :deep(h2) {
  margin: 8px 0 0;
  font-size: 24px;
  color: var(--f0-strong);
}

.article-body :deep(blockquote) {
  margin: 0;
  padding: 4px 0 4px 20px;
  border-left: 3px solid var(--f0-accent);
  color: #3a3a3a;
  font-style: italic;
}

.article-body :deep(.quote-comment) {
  color: #5f5c56;
}

.article-body :deep(code) {
  background: var(--f0-code-bg);
  padding: 1px 5px;
  font-family: var(--font-body);
}

.article-body :deep(pre) {
  margin: 0;
  padding: 18px 20px;
  background: var(--f0-code-bg);
  border: 1px solid var(--f0-code-border);
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.6;
  overflow-x: auto;
}

.article-body :deep(pre code) {
  background: none;
  padding: 0;
}

.article-body :deep(img) {
  max-width: 100%;
  display: block;
}

.article-body :deep(.image-pair) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.article-body :deep(.image-pair figure) {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.article-body :deep(.image-pair img) {
  width: 100%;
  height: auto;
}

.article-body :deep(.image-pair figcaption) {
  font-size: 14px;
  color: var(--f0-muted);
}

.article-body :deep(.reference-card) {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px 18px;
  border: 1px solid var(--f0-rule);
  background: #ffffff;
  box-shadow: 3px 3px 0 var(--f0-page);
}

.article-body :deep(.ref-label) {
  font-size: 13px;
  color: var(--f0-muted);
}

.article-body :deep(.ref-title) {
  color: var(--f0-accent);
  font-weight: 700;
}

.article-body :deep(.ref-domain) {
  font-size: 14px;
  color: var(--f0-muted);
}

.article-footer {
  margin-top: 12px;
  padding-top: 18px;
  border-top: 1px dashed var(--f0-rule);
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}
</style>
