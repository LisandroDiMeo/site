import { computed, unref } from 'vue'
import { parseFrontMatter } from '@/utils/frontMatter'
import { renderMarkdown } from '@/utils/markdownRenderer'

// Turns a raw post (content = markdown + optional front-matter, categories, createdAt)
// into everything ArticleView/WritingView need to render it.
export function useMarkdownArticle(postRef) {
  const parsed = computed(() => parseFrontMatter(unref(postRef)?.content))

  const title = computed(() => parsed.value.meta.title || unref(postRef)?.title || 'Untitled')
  const modified = computed(() => parsed.value.meta.modified || null)
  const note = computed(() => parsed.value.meta.note || null)
  const categories = computed(() => unref(postRef)?.categories || [])
  const section = computed(() => categories.value[0] || 'uncategorized')
  const tags = computed(() => categories.value.slice(1))
  const publishedAt = computed(() => unref(postRef)?.createdAt || null)
  const html = computed(() => renderMarkdown(parsed.value.body))

  return { title, modified, note, section, tags, publishedAt, html }
}
