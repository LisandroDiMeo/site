<template>
  <AppShell title-bar-text="Command Prompt — lisandro\hello">
    <div class="header">
      <div class="prompt-line">
        C:\lisandro&gt; cd hello
      </div>
      <AppNav active-section="hello" />
    </div>

    <div class="page-heading">
      <h1>Hello</h1>
    </div>

    <div class="bio">
      <p>
        I'm Lisandro Diaz Di Meo, a Computer Scientist graduated from Universidad de Buenos Aires,
        currently working as a Senior Mobile Engineer at
        <a
          href="https://qubika.com/"
          target="_blank"
          rel="noopener noreferrer"
        >Qubika</a>.
      </p>
      <p>
        At the moment I'm focused on AI agents for automated test generation, and on software
        analysis techniques more broadly — dynamic and static analysis, fuzzing, search-based
        software engineering.
      </p>
      <p>
        Outside of code: music, reading, writing, <RouterLink to="/photos">
          photography
        </RouterLink>,
        teaching, and time with family and friends.
      </p>
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
  </AppShell>
</template>

<script setup>
import AppShell from '@/components/shell/AppShell.vue'
import AppNav from '@/components/shell/AppNav.vue'

const elsewhereLinks = [
  { label: 'linkedin', href: 'https://www.linkedin.com/in/lisandrodimeo' }
]
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

.page-heading h1 {
  margin: 0;
  font-size: var(--fs-h1);
  line-height: 1.1;
  color: var(--f0-strong);
}

.bio {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
}

.elsewhere {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  color: var(--f0-accent);
  font-weight: 700;
}

.elsewhere-links {
  display: flex;
  gap: 28px;
}

.elsewhere-links a {
  color: var(--f0-strong);
  border-bottom-color: var(--f0-rule);
}
</style>
