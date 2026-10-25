import { chapters, faqs, glossary, formulas } from '../content/index.js'
import { blocksToPlain, normalize, texToPlain } from './text.js'

// 表記ゆれ・言い換え（どれか1つで検索しても全部ヒットさせる）
const SYNONYMS = [
  ['キルヒホッフ', 'キルヒホフ', 'kirchhoff'],
  ['コンデンサー', 'コンデンサ', 'キャパシタ', 'capacitor'],
  ['コイル', 'インダクタ', 'ソレノイド'],
  ['起電力', 'emf', '誘導起電力'],
  ['電圧', '電位差'],
  ['電場', '電界'],
  ['磁場', '磁界', '磁束密度'],
  ['位置エネルギー', 'ポテンシャル'],
  ['マクスウェル', 'マックスウェル', 'maxwell'],
  ['ファラデー', 'faraday'],
  ['ローレンツ', 'lorentz'],
  ['クーロン', 'coulomb'],
  ['ガウス', 'gauss'],
  ['レンツ', 'lenz'],
  ['変圧器', 'トランス'],
  ['直後', '瞬間'],
  ['十分時間', '定常'],
  ['静電場', 'クーロン電場'],
  ['誘導電場', '非クーロン電場'],
]

const synMap = new Map()
for (const group of SYNONYMS) {
  const ns = group.map(normalize)
  for (const n of ns) synMap.set(n, ns)
}

function expand(term) {
  const n = normalize(term)
  const out = new Set([n])
  for (const [k, group] of synMap) {
    if (n.includes(k)) group.forEach((g) => out.add(n.replace(k, g)))
  }
  return [...out].filter(Boolean)
}

let INDEX = null

function build() {
  const items = []
  for (const ch of chapters) {
    for (const sec of ch.sections) {
      const text = blocksToPlain(sec.blocks)
      items.push({
        kind: 'section',
        key: `${ch.id}/${sec.id}`,
        title: sec.title,
        context: `第${ch.num}章 ${ch.title}`,
        href: `#/ch/${ch.id}/${sec.id}`,
        tags: ch.tags,
        level: sec.level,
        text,
      })
    }
  }
  for (const f of faqs) {
    items.push({
      kind: 'faq',
      key: f.id,
      title: f.q,
      context: 'Q&A',
      href: `#/faq/${f.id}`,
      tags: f.tags,
      level: f.level,
      text: [f.setting, f.short, f.viewpoint, f.misconception, blocksToPlain(f.answer)].filter(Boolean).join('\n'),
    })
  }
  for (const g of glossary) {
    items.push({ kind: 'glossary', key: g.term, title: g.term, context: '用語集', href: `#/glossary/${encodeURIComponent(g.term)}`, tags: [g.reading], text: `${g.plain}\n${g.precise}` })
  }
  for (const f of formulas) {
    items.push({ kind: 'formula', key: f.name, title: f.name, context: `公式集・${f.group}`, href: `#/formulas`, tags: [f.group], text: `${texToPlain(f.tex)}\n根拠：${f.basis}\n条件：${f.cond}` })
  }
  for (const it of items) {
    it.nTitle = normalize(it.title)
    it.nTags = normalize((it.tags || []).join(' '))
    it.nText = normalize(it.text)
  }
  return items
}

const KIND_WEIGHT = { faq: 1.15, section: 1, glossary: 1.1, formula: 0.9 }

export function search(query, { kinds } = {}) {
  if (!INDEX) INDEX = build()
  const terms = query.split(/[\s　]+/).filter(Boolean)
  if (!terms.length) return []
  const expanded = terms.map(expand)
  const results = []
  for (const it of INDEX) {
    if (kinds && !kinds.includes(it.kind)) continue
    let score = 0
    let ok = true
    for (const variants of expanded) {
      let best = 0
      for (const v of variants) {
        let s = 0
        if (it.nTitle.includes(v)) s += 12
        if (it.nTags.includes(v)) s += 6
        const c = countOccur(it.nText, v)
        if (c) s += 2 + Math.min(c, 8)
        best = Math.max(best, s)
      }
      if (!best) { ok = false; break }
      score += best
    }
    if (ok) results.push({ ...it, score: score * (KIND_WEIGHT[it.kind] || 1), snippet: makeSnippet(it.text, expanded.flat()) })
  }
  return results.sort((a, b) => b.score - a.score)
}

function countOccur(hay, needle) {
  if (!needle) return 0
  let n = 0
  let i = hay.indexOf(needle)
  while (i !== -1 && n < 50) { n++; i = hay.indexOf(needle, i + needle.length) }
  return n
}

// 本文のうち、最初にヒットした箇所の周辺を抜き出す
function makeSnippet(text, variants) {
  const lines = text.split('\n')
  for (const line of lines) {
    const nl = normalize(line)
    if (variants.some((v) => nl.includes(v))) return line.length > 140 ? line.slice(0, 140) + '…' : line
  }
  return lines[0]?.slice(0, 140) || ''
}

// ハイライト用：生の文字列中で検索語に当たる範囲を返す
export function highlightTerms(query) {
  return query.split(/[\s　]+/).filter(Boolean).flatMap((t) => [t, ...(SYNONYMS.find((g) => g.some((x) => normalize(x) === normalize(t))) || [])])
}

export const SUGGESTIONS = ['起電力 電圧降下', 'キルヒホッフ 符号', '直後 コンデンサー', '位置エネルギー 2物体', 'ガウス 閉曲面', '磁束 面積', 'コイル 静電場', '変圧器 周波数', '消費電力', 'マクスウェル']
