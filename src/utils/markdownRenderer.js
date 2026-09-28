import { marked, Renderer } from 'marked'
import DOMPurify from 'dompurify'
import config from '@/config/env'

// Body images are author-supplied URLs (not part of photo-index.json), so they don't
// go through ImageCacheManager. Relative paths are resolved against the same photo
// host as the gallery; absolute URLs are used as-is.
function resolveImageSrc(src) {
  if (!src) return src
  if (/^https?:\/\//i.test(src)) return src
  return config.getPhotoUrl(src.replace(/^\//, ''))
}

function renderImagePair(tokens) {
  const figures = tokens
    .map((token) => {
      const alt = token.text || ''
      const caption = alt ? `<figcaption>${alt}</figcaption>` : ''
      return `<figure><img src="${resolveImageSrc(token.href)}" alt="${alt}" loading="lazy">${caption}</figure>`
    })
    .join('')
  return `<div class="image-pair">${figures}</div>\n`
}

function referenceDomain(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, '')
  } catch {
    return href
  }
}

function renderReferenceCard(token) {
  return `<a class="reference-card" href="${token.href}" target="_blank" rel="noopener noreferrer">
<span class="ref-label">&#8599; reference</span>
<span class="ref-title">${token.text || token.href}</span>
<span class="ref-domain">${referenceDomain(token.href)}</span>
</a>\n`
}

// A `<p><em>...</em></p>` immediately following a `<blockquote>` is a short
// annotation on the quote (the manu.zone "asterisk" convention) — mark it so
// it can be styled distinctly from a regular paragraph.
function markQuoteComments(html) {
  return html.replace(
    /(<\/blockquote>\s*)<p>(\s*<em>[\s\S]*?<\/em>\s*)<\/p>/g,
    '$1<p class="quote-comment">$2</p>'
  )
}

function buildRenderer() {
  const renderer = new Renderer()

  renderer.image = (token) => {
    const alt = token.text || ''
    return `<img src="${resolveImageSrc(token.href)}" alt="${alt}" loading="lazy">`
  }

  renderer.paragraph = function paragraph(token) {
    const inline = (token.tokens || []).filter(
      (t) => !(t.type === 'text' && t.text.trim() === '')
    )

    // Two consecutive images, nothing else: side-by-side figure pair.
    if (inline.length === 2 && inline.every((t) => t.type === 'image')) {
      return renderImagePair(inline)
    }

    // A single bare link, nothing else: reference card.
    if (inline.length === 1 && inline[0].type === 'link') {
      return renderReferenceCard(inline[0])
    }

    return `<p>${this.parser.parseInline(token.tokens)}</p>\n`
  }

  return renderer
}

export function renderMarkdown(body) {
  const html = marked.parse(body ?? '', { renderer: buildRenderer() })
  return DOMPurify.sanitize(markQuoteComments(html))
}
