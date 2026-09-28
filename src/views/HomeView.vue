<template>
  <AppShell title-bar-text="Command Prompt — lisandro">
    <div class="version-banner">
      Lisandro Di Meo [Version 27.0]<br>
      (c) CABA, Argentina. All rights reserved.
    </div>

    <div class="intro">
      <h1 class="name">
        Lisandro Di Meo
      </h1>
      <p class="tagline">
        Software Engineer and university professor.
        Here I'll share a photograph diary, some toughts, and things I enjoy.
      </p>
    </div>

    <AppNav active-section="home" />

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
      <span class="prompt-label">lisandro@dimeo&gt;</span>
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

.col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  color: var(--f0-accent);
  font-weight: 700;
}

.writing-item {
  display: flex;
  gap: 20px;
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

</style>
