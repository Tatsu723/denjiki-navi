import { createContext, useContext, useMemo } from 'react'
import katex from 'katex'
import { chapterById, faqById } from '../content/index.js'

// 検索語ハイライト用のコンテキスト
export const HighlightContext = createContext([])

const katexCache = new Map()
function renderTex(tex, display) {
  const k = (display ? 'D:' : 'I:') + tex
  if (!katexCache.has(k)) {
    katexCache.set(k, katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: false, output: 'html' }))
  }
  return katexCache.get(k)
}

export function Tex({ tex, display = false }) {
  const html = useMemo(() => renderTex(tex, display), [tex, display])
  return display ? <div className="math-display" dangerouslySetInnerHTML={{ __html: html }} /> : <span dangerouslySetInnerHTML={{ __html: html }} />
}

const TOKEN = /(\$[^$]+\$|\*\*[^*]+\*\*|==[^=]+==|\[\[[^\]]+\]\])/g

function Highlighted({ text }) {
  const terms = useContext(HighlightContext)
  if (!terms.length || !text) return text
  const escaped = terms.filter((t) => t.length > 0).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (!escaped.length) return text
  const re = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(re)
  return parts.map((s, i) => (i % 2 === 1 ? <mark key={i}>{s}</mark> : s))
}

function Link({ spec }) {
  // [[ch:id|label]] [[ch:id/sec|label]] [[faq:id|label]] [[g:用語]]
  const [target, label] = spec.split('|')
  const [kind, id] = target.split(':')
  if (kind === 'g') return <a className="xref xref-g" href={`#/glossary/${encodeURIComponent(id)}`}>{label || id}</a>
  if (kind === 'ch') {
    const [cid] = id.split('/')
    const ch = chapterById[cid]
    return <a className="xref" href={`#/ch/${id}`}>{label || ch?.title || id}</a>
  }
  if (kind === 'faq') {
    const f = faqById[id]
    return <a className="xref xref-faq" href={`#/faq/${id}`} title={f?.q}>{label || 'Q&A'}</a>
  }
  return label || spec
}

export function Rich({ text }) {
  if (!text) return null
  const parts = text.split(TOKEN)
  return parts.map((part, i) => {
    if (!part) return null
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) return <Tex key={i} tex={part.slice(1, -1)} />
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}><Rich text={part.slice(2, -2)} /></strong>
    if (part.startsWith('==') && part.endsWith('==')) return <em key={i} className="emph"><Rich text={part.slice(2, -2)} /></em>
    if (part.startsWith('[[') && part.endsWith(']]')) return <Link key={i} spec={part.slice(2, -2)} />
    return <Highlighted key={i} text={part} />
  })
}
