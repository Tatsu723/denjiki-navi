// 文字列の正規化・プレーンテキスト化（検索とコピー用）

const GREEK = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', epsilon: 'ε', varepsilon: 'ε',
  theta: 'θ', lambda: 'λ', mu: 'μ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ',
  varphi: 'φ', Phi: 'Φ', omega: 'ω', Omega: 'Ω', infty: '∞', times: '×', cdot: '·',
  partial: '∂', nabla: '∇', approx: '≈', fallingdotseq: '≒', neq: '≠', leq: '≤', geq: '≥',
  to: '→', rightarrow: '→', Rightarrow: '⇒', iff: '⇔', pm: '±', int: '∫', oint: '∮', sum: 'Σ',
}

// TeX を「読める」プレーンテキストに雑に変換する（コピー・検索用）
export function texToPlain(tex) {
  let s = tex
  for (let i = 0; i < 4; i++) {
    s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_, a, b) => {
      const wrap = (x) => (x.length > 1 && /[+\-\s]/.test(x) ? `(${x})` : x)
      return `${wrap(a)}/${wrap(b)}`
    })
    s = s.replace(/\\sqrt\{([^{}]*)\}/g, '√($1)')
    s = s.replace(/\\(vec|boldsymbol|mathbf|mathrm|text|textbf|overline|bar|hat|left|right)\s*\{([^{}]*)\}/g, '$2')
  }
  s = s.replace(/\\([A-Za-z]+)/g, (m, name) => (GREEK[name] !== undefined ? GREEK[name] : ''))
  s = s.replace(/\\[,;!: ]/g, ' ')
  s = s.replace(/\^\{([^{}]*)\}/g, '^$1').replace(/_\{([^{}]*)\}/g, '_$1')
  s = s.replace(/[{}]/g, '')
  s = s.replace(/\\left|\\right/g, '')
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

// リッチテキスト記法を剥がしてプレーンにする
export function richToPlain(text = '') {
  return text
    .replace(/\$\$?([^$]+)\$\$?/g, (_, t) => texToPlain(t))
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/==([^=]+)==/g, '$1')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[g:([^\]]+)\]\]/g, '$1')
}

// ブロック配列 → プレーンテキスト
export function blocksToPlain(blocks = []) {
  const out = []
  const walk = (bs) => {
    for (const b of bs || []) {
      if (!b) continue
      if (typeof b === 'string') { out.push(richToPlain(b)); continue }
      if (b.title) out.push(richToPlain(b.title))
      if (b.text) out.push(richToPlain(b.text))
      if (b.tex) out.push(texToPlain(b.tex))
      if (b.items) b.items.forEach((it) => (typeof it === 'string' ? out.push('・' + richToPlain(it)) : walk([it])))
      if (b.steps) b.steps.forEach((st, i) => { out.push(`${i + 1}. ${richToPlain(st.title || '')}`); walk(st.body) })
      if (b.rows) { if (b.head) out.push(b.head.map(richToPlain).join(' / ')); b.rows.forEach((r) => out.push(r.map(richToPlain).join(' / '))) }
      if (b.q) out.push('Q. ' + richToPlain(b.q))
      if (b.a) walk(Array.isArray(b.a) ? b.a : [b.a])
      if (b.body) walk(b.body)
      if (b.caption) out.push(richToPlain(b.caption))
    }
  }
  walk(blocks)
  return out.join('\n')
}

// 検索用正規化：全角半角統一・カタカナ→ひらがな・小文字化・空白除去
export function normalize(s = '') {
  return s
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[\s・、。，．,.「」『』（）()【】]/g, '')
}
