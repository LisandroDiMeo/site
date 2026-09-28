import { parseFrontMatter } from '@/utils/frontMatter'

function postId(post) {
  return post.id ?? post._id
}

function postTitle(post) {
  return parseFrontMatter(post.content).meta.title || 'Untitled'
}

function postSection(post) {
  return post.categories?.[0] || 'uncategorized'
}

// Groups posts by their primary category for the /writing index, newest first
// within each section.
export function groupPostsByCategory(posts) {
  const sections = new Map()

  for (const post of posts) {
    const section = postSection(post)
    if (!sections.has(section)) sections.set(section, [])
    sections.get(section).push(post)
  }

  return Array.from(sections.entries()).map(([section, items]) => ({
    section,
    posts: [...items].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
  }))
}

export function findPostById(posts, id) {
  return posts.find((post) => String(postId(post)) === String(id))
}

export function previousPost(posts, current) {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
  const index = sorted.findIndex((post) => postId(post) === postId(current))
  return index >= 0 ? sorted[index + 1] : undefined
}

export { postId, postTitle }
