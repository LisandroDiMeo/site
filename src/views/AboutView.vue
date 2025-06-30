<template>
  <WindowFrame title="about me">
    <NavigationBar @back="goBack" />
    <div class="about-content">
      <h2>About Me</h2>
      <p>
        I'm Lisandro Diaz Di Meo, a Computer Scientist who graduated from Universidad de Buenos Aires.
        I'm currently working as a Senior Mobile Engineer at <a href="https://qubika.com/" target="_blank" rel="noopener noreferrer">Qubika</a>.
      </p>

      <p>
        I'm passionate about creating software that truly serves people. Through my diverse experience,
        I bring valuable insights to different types of teams, offering a unique perspective that bridges
        both technical excellence and thoughtful product design.
      </p>

      <p>
        At the moment, I'm focused on developing AI agents for automated test generation.
        My primary interests lie in various software analysis techniques that support and enhance
        the software development process. This includes approaches like dynamic and static analysis,
        fuzzing, search-based software engineering, and related methodologies.
      </p>

      <p>
        When I'm not coding, I enjoy music, reading, writing, <RouterLink to="photos">photography</RouterLink>,
        teaching, and spending quality time with my family and friends :)
      </p>

      <p>
        For professional connections or any inquiries, you can find me on
        <a href="https://www.linkedin.com/in/lisandrodimeo" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        or GitHub.
      </p>

      <div class="me">
        <img src="/assets/me.jpg" alt="Me!">
      </div>
    </div>
  </WindowFrame>
</template>

<script>
import { useRouter } from 'vue-router'
import WindowFrame from '@/components/common/WindowFrame.vue'
import NavigationBar from '@/components/common/NavigationBar.vue'

export default {
  name: 'AboutView',
  components: {
    WindowFrame,
    NavigationBar
  },
  setup() {
    const router = useRouter()

    const goBack = () => {
      router.push({ name: 'home' })
    }

    const navigateTo = (route) => {
      router.push({ name: route })
    }

    return {
      goBack, navigateTo
    }
  }
}
</script>

<style scoped>
.about-content {
  padding: var(--space-5);
  background-color: var(--color-bg-secondary);
  border: var(--border-inset);
  border-top-color: var(--border-inset-top);
  border-left-color: var(--border-inset-left);
  border-right-color: var(--border-inset-right);
  border-bottom-color: var(--border-inset-bottom);
  margin-top: var(--space-5);
}

h2 {
  font-size: var(--font-size-md);
  margin-bottom: var(--space-4);
}

p {
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-5);
}

a {
  color: var(--color-text-primary);
  text-decoration: underline;
}

.me {
  text-align: center;
  margin-top: var(--space-7);
}

.me img {
  width: 50%;
}
</style>