<template>
  <AppShell title-bar-text="Command Prompt — lisandro">
    <div class="version-banner">
      Lisandro Dimeo [Version 27.0]<br>
      (c) Almagro, Buenos Aires. All rights reserved.<br>
      C:\&gt; color F0
    </div>

    <div class="intro">
      <h1 class="name">
        Lisandro Dimeo
      </h1>
      <p class="tagline">
        Mobile engineer (Android, Swift, React Native) and university professor.
        I write about apps, teaching, Japanese, and the things I collect.
      </p>
    </div>

    <AppNav active-section="home" />

    <div class="two-col">
      <section class="col">
        <div class="section-label">
          &gt; now
        </div>
        <div
          v-for="item in nowItems"
          :key="item"
          class="now-item"
        >
          <span class="dash">&mdash;&mdash;</span><span>{{ item }}</span>
        </div>
      </section>

      <section
        v-if="recentPosts.length"
        class="col"
      >
        <div class="section-label">
          &gt; writing
        </div>
        <div
          v-for="post in recentPosts"
          :key="postId(post)"
          class="writing-item"
        >
          <span class="writing-date">{{ formatDate(post.createdAt) }}</span>
          <RouterLink
            :to="`/writing/${postId(post)}`"
            class="writing-title"
          >
            {{ postTitle(post) }}
          </RouterLink>
        </div>
      </section>
    </div>

    <section
      v-if="elsewhereLinks.length"
      class="elsewhere"
    >
      <div class="section-label">
        &gt; elsewhere
      </div>
      <div class="elsewhere-links">
        <a
          v-for="link in elsewhereLinks"
          :key="link.href"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ link.label }}
        </a>
      </div>
    </section>

    <div class="footer-prompt">
      <span class="prompt-label">lisandro@almagro&gt;</span>
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
import { postId, postTitle } from '@/utils/writingSlug'

const nowItems = [
  'Leading Android on a fitness app',
  'Building kokan.trade — vinyl, Pokémon cards & retro games',
  'Studying Japanese · Japan in December'
]

const elsewhereLinks = [
  { label: 'linkedin', href: 'https://www.linkedin.com/in/lisandrodimeo' }
]

const postsStore = usePostsStore()

onMounted(() => {
  if (config.posts.enabled) postsStore.fetchPosts()
})

const recentPosts = computed(() =>
  [...postsStore.posts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)
)

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toISOString().slice(0, 7)
}
</script>

<style scoped>
.version-banner {
  color: var(--f0-muted);
  font-size: var(--fs-meta);
}

.intro {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.name {
  margin: 0;
  font-size: var(--fs-home-name);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.01em;
  color: var(--f0-strong);
}

.tagline {
  max-width: 760px;
  margin: 0;
}

.two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 56px;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  color: var(--f0-accent);
  font-weight: 700;
}

.now-item,
.writing-item {
  display: flex;
  gap: 20px;
}

.dash {
  color: var(--f0-muted);
}

.writing-date {
  color: var(--f0-muted);
}

.writing-title {
  color: var(--f0-strong);
  border-bottom-color: var(--f0-rule);
}

.elsewhere {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.elsewhere-links {
  display: flex;
  gap: 28px;
}

.elsewhere-links a {
  color: var(--f0-strong);
  border-bottom-color: var(--f0-rule);
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
  animation: blink 1s steps(1) infinite;
}

@media (max-width: 768px) {
  .two-col {
    grid-template-columns: 1fr;
  }
}
</style>
