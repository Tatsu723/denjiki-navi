import { useEffect, useMemo, useState } from 'react'
import { chapters, chapterById, faqs, faqById, glossary, formulas } from './content/index.js'
import { Blocks } from './components/Blocks.jsx'
import { Rich, Tex, HighlightContext } from './components/Rich.jsx'
import { search, highlightTerms, SUGGESTIONS } from './lib/search.js'
import { blocksToPlain, normalize } from './lib/text.js'

// ───────── 共通部品 ─────────

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { ok = false }
    document.body.removeChild(ta)
    return ok
  }
}

function CopyBtn({ getText, label = 'コピー' }) {
  const [state, setState] = useState('')
  return (
    <button
      className="action-btn"
      onClick={async () => {
        const ok = await copyText(getText())
        setState(ok ? 'コピーしました' : 'コピーできませんでした')
        setTimeout(() => setState(''), 1800)
      }}
    >
      ⧉ {state || label}
    </button>
  )
}

function PrintBtn() {
  return <button className="action-btn print-btn" onClick={() => window.print()}>⎙ 印刷</button>
}

function FaqCard({ f }) {
  return (
    <a className="faq-card" href={`#/faq/${f.id}`}>
      <div className="faq-card-q"><span className="qa-mark">Q</span><span>{f.q}</span></div>
      <div className="faq-card-a">{f.short}</div>
      <div className="faq-card-meta">
        {f.source === 'knowhow' && <span className="src-badge">実際の質問より</span>}
      </div>
    </a>
  )
}

// ───────── ホーム ─────────
export function HomePage() {
  const emphasis = chapters.filter((c) => c.emphasis)
  const featured = ['rod-potential', 'emf-vs-drop', 'smaller-resistance', 'two-body-energy'].map((id) => faqById[id])
  return (
    <div className="page home">
      <section className="hero">
        <p className="eyebrow">大学受験生のための電磁気学 ／ 質問対応ナビ</p>
        <h1>公式を「覚える」から、<br />原理から「導ける」へ。</h1>
        <p className="lead">
          電磁気学は、4つの大原則（マクスウェル方程式）から始まります。この教材では、受験生が実際につまずいた質問を軸に、
          「なぜそうなるのか」を大原則に立ち返って解説します。
        </p>
        <div className="suggest">
          {SUGGESTIONS.slice(0, 6).map((s) => <a key={s} href={`#/search?q=${encodeURIComponent(s)}`} className="suggest-chip">{s}</a>)}
        </div>
      </section>

      <section className="home-principles">
        <h2>この教材を貫く4つの考え方</h2>
        <div className="principle-grid">
          {[
            ['上流から考える', '迷ったら、より大原則に近い法則に戻る。解法も「起電力→回路→運動」の順。', '#/ch/flow'],
            ['性質には根拠の式がある', '「電流は抵抗の小さい方へ」も式から。適用条件を式で確認する。', '#/faq/smaller-resistance'],
            ['定義を言語化する', '起電力・電圧降下・電位・上流側…自分の言葉で説明できるか。', '#/ch/emf'],
            ['任意性を味方に', '閉曲面も磁束の面も「自分に都合の良いもの」を選んでよい。', '#/faq/flux-area'],
          ].map(([t, d, href], i) => (
            <a key={t} className="principle" href={href}>
              <span className="principle-num">{i + 1}</span>
              <strong>{t}</strong>
              <span>{d}</span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>重点テーマ</h2>
        </div>
        <div className="card-grid">
          {emphasis.map((c) => (
            <a key={c.id} className="ch-card emphasis" href={`#/ch/${c.id}`}>
              <span className="ch-card-num">第{c.num}章</span>
              <strong>{c.title}</strong>
              <span className="ch-card-sub">{c.subtitle}</span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>受験生がよくつまずく質問</h2>
          <a href="#/faq" className="more">すべて見る（{faqs.length}件）→</a>
        </div>
        <div className="faq-grid">{featured.map((f) => <FaqCard key={f.id} f={f} />)}</div>
      </section>
    </div>
  )
}

// ───────── 章ページ ─────────
export function ChapterPage({ chapter, sectionId }) {
  const idx = chapters.indexOf(chapter)
  const prev = chapters[idx - 1]
  const next = chapters[idx + 1]
  const related = faqs.filter((f) => f.chapters.includes(chapter.id))

  useEffect(() => {
    if (!sectionId) return
    const t = setTimeout(() => document.getElementById(`sec-${sectionId}`)?.scrollIntoView({ block: 'start' }), 60)
    return () => clearTimeout(t)
  }, [chapter.id, sectionId])

  return (
    <article className="page chapter">
      <header className="ch-header">
        <div className="ch-kicker">
          第{chapter.num}章{chapter.emphasis && <span className="nav-star big">重点</span>}
        </div>
        <h1>{chapter.title}</h1>
        <p className="ch-sub">{chapter.subtitle}</p>
        <PrintBtn />
      </header>

      <nav className="ch-toc" aria-label="この章の目次">
        <div className="ch-toc-title">この章の内容</div>
        <ol>
          {chapter.sections.map((s) => (
            <li key={s.id}><a href={`#/ch/${chapter.id}/${s.id}`}>{s.title}</a></li>
          ))}
          {related.length > 0 && <li><a href={`#/ch/${chapter.id}/related`}>関連する質問（{related.length}件）</a></li>}
        </ol>
      </nav>

      {chapter.sections.map((s, i) => (
        <section key={s.id} id={`sec-${s.id}`} className="ch-section">
          <div className="sec-head">
            <h2><span className="sec-num">{chapter.num}.{i + 1}</span><Rich text={s.title} /></h2>
          </div>
          <Blocks blocks={s.blocks} />
        </section>
      ))}

      {related.length > 0 && (
        <section id="sec-related" className="ch-section related-faqs">
          <h2>この章に関連する質問</h2>
          <div className="faq-grid">{related.map((f) => <FaqCard key={f.id} f={f} />)}</div>
        </section>
      )}

      <nav className="pager">
        {prev ? <a href={`#/ch/${prev.id}`} className="pager-link">← 第{prev.num}章 {prev.title}</a> : <span />}
        {next ? <a href={`#/ch/${next.id}`} className="pager-link next">第{next.num}章 {next.title} →</a> : <span />}
      </nav>
    </article>
  )
}

// ───────── Q&A一覧 ─────────
export function FaqListPage() {
  const [ch, setCh] = useState('')
  const [src, setSrc] = useState('')
  const [text, setText] = useState('')
  const list = useMemo(() => {
    const n = normalize(text)
    return faqs.filter(
      (f) =>
        (!ch || f.chapters.includes(ch)) &&
        (!src || f.source === src) &&
        (!n || normalize(f.q + f.short + f.tags.join('') + (f.viewpoint || '')).includes(n)),
    )
  }, [ch, src, text])

  return (
    <div className="page">
      <div className="title-row"><h1>よくある質問 Q&A</h1><PrintBtn /></div>
      <p className="lead">受験生から実際に寄せられた質問と、その回答の着眼点です。「ひとことで」は、まず押さえてほしい要点です。</p>
      <div className="filters">
        <input type="search" placeholder="質問を絞り込み" value={text} onChange={(e) => setText(e.target.value)} aria-label="Q&Aを絞り込み" />
        <select value={ch} onChange={(e) => setCh(e.target.value)} aria-label="章で絞り込み">
          <option value="">すべての章</option>
          {chapters.map((c) => <option key={c.id} value={c.id}>第{c.num}章 {c.title}</option>)}
        </select>
        <select value={src} onChange={(e) => setSrc(e.target.value)} aria-label="出典で絞り込み">
          <option value="">すべて</option>
          <option value="knowhow">実際の質問より</option>
          <option value="added">追加した質問</option>
        </select>
      </div>
      <p className="count">{list.length}件</p>
      <div className="faq-grid">{list.map((f) => <FaqCard key={f.id} f={f} />)}</div>
    </div>
  )
}

// ───────── Q&A詳細 ─────────
export function FaqDetailPage({ id }) {
  const f = faqById[id]
  if (!f) return <div className="page"><h1>質問が見つかりません</h1><a href="#/faq">一覧へ</a></div>
  const related = faqs.filter((x) => x.id !== f.id && x.chapters.some((c) => f.chapters.includes(c))).slice(0, 4)

  const answerText = () =>
    [`【質問】${f.q}`, '', ...(f.setting ? [`【想定している問題】${f.setting}`, ''] : []), `【ひとことで】${f.short}`, '', blocksToPlain(f.answer)].join('\n')

  return (
    <article className="page faq-detail">
      <a href="#/faq" className="back">← Q&A一覧</a>
      <div className="faq-q-big">
        <span className="qa-mark big">Q</span>
        <h1>{f.q}</h1>
      </div>
      <div className="faq-meta">
        {f.source === 'knowhow' && <span className="src-badge">実際の質問より</span>}
      </div>

      {f.setting && (
        <div className="setting">
          <div className="short-label">想定している問題</div>
          <p>{f.setting}</p>
        </div>
      )}

      <div className="short-answer">
        <div className="short-label">ひとことで</div>
        <p>{f.short}</p>
      </div>

      <div className="viewpoint-row">
        {f.viewpoint && (
          <div className="viewpoint"><span className="vp-label">◎ 着眼点</span>{f.viewpoint}</div>
        )}
        {f.misconception && (
          <div className="viewpoint warn"><span className="vp-label">! ありがちな誤解</span>{f.misconception}</div>
        )}
      </div>

      <section className="faq-answer">
        <div className="answer-head">
          <h2><span className="qa-mark a">A</span>回答</h2>
          <div className="sec-tools">
            <CopyBtn label="回答文をコピー" getText={answerText} />
            <PrintBtn />
          </div>
        </div>
        <Blocks blocks={f.answer} />
      </section>

      <section className="faq-links">
        <h3>くわしく学ぶ</h3>
        <div className="link-row">
          {f.chapters.map((c) => <a key={c} className="action-btn" href={`#/ch/${c}`}>第{chapterById[c].num}章 {chapterById[c].title} →</a>)}
        </div>
        {related.length > 0 && (
          <>
            <h3>関連する質問</h3>
            <div className="faq-grid">{related.map((x) => <FaqCard key={x.id} f={x} />)}</div>
          </>
        )}
      </section>
    </article>
  )
}

// ───────── 検索 ─────────
const KIND_LABEL = { faq: 'Q&A', section: '解説', glossary: '用語', formula: '公式' }

export function SearchPage({ q, kind }) {
  const results = useMemo(() => (q ? search(q) : []), [q])
  const counts = useMemo(() => results.reduce((acc, r) => ({ ...acc, [r.kind]: (acc[r.kind] || 0) + 1 }), {}), [results])
  const shown = kind ? results.filter((r) => r.kind === kind) : results
  const terms = useMemo(() => highlightTerms(q), [q])

  return (
    <div className="page">
      <h1>検索結果</h1>
      {!q && <p>上の検索窓にキーワードを入力してください。スペース区切りで複数語のAND検索ができます。</p>}
      {q && (
        <>
          <p className="lead">「<strong>{q}</strong>」の検索結果：{results.length}件</p>
          <div className="kind-tabs" role="tablist">
            <a className={!kind ? 'on' : ''} href={`#/search?q=${encodeURIComponent(q)}`}>すべて {results.length}</a>
            {['faq', 'section', 'glossary', 'formula'].map((k) => (
              <a key={k} className={kind === k ? 'on' : ''} href={`#/search?q=${encodeURIComponent(q)}&kind=${k}`}>
                {KIND_LABEL[k]} {counts[k] || 0}
              </a>
            ))}
          </div>
          {results.length === 0 && (
            <div className="empty">
              <p>見つかりませんでした。語を減らすか、別の言い方を試してください。</p>
              <div className="suggest">{SUGGESTIONS.map((s) => <a key={s} href={`#/search?q=${encodeURIComponent(s)}`} className="suggest-chip">{s}</a>)}</div>
            </div>
          )}
          <HighlightContext.Provider value={terms}>
            <ul className="results">
              {shown.map((r) => (
                <li key={r.kind + r.key}>
                  <a href={r.href} className="result">
                    <div className="result-meta">
                      <span className={`kind kind-${r.kind}`}>{KIND_LABEL[r.kind]}</span>
                      <span className="result-ctx">{r.context}</span>
                    </div>
                    <div className="result-title"><Rich text={r.title} /></div>
                    <div className="result-snippet"><Rich text={r.snippet} /></div>
                  </a>
                </li>
              ))}
            </ul>
          </HighlightContext.Provider>
        </>
      )}
    </div>
  )
}

// ───────── 用語集 ─────────
export function GlossaryPage({ focus }) {
  const [text, setText] = useState('')
  const [precise, setPrecise] = useState(false)
  const list = useMemo(() => {
    const n = normalize(text)
    return glossary.filter((g) => !n || normalize(g.term + g.reading + g.plain + g.precise).includes(n))
  }, [text])

  useEffect(() => {
    if (focus) setTimeout(() => document.getElementById(`g-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 30)
  }, [focus])

  return (
    <div className="page">
      <div className="title-row"><h1>用語集</h1><PrintBtn /></div>
      <p className="lead">「かみ砕いた説明」で生徒にイメージを、「正確な定義」で厳密さを。切り替えて使えます。</p>
      <div className="filters">
        <input type="search" placeholder="用語を絞り込み" value={text} onChange={(e) => setText(e.target.value)} aria-label="用語を絞り込み" />
        <label className="switch">
          <input type="checkbox" checked={precise} onChange={(e) => setPrecise(e.target.checked)} />
          <span>正確な定義も表示</span>
        </label>
      </div>
      <dl className="glossary">
        {list.map((g) => (
          <div key={g.term} id={`g-${g.term}`} className={`g-item ${focus === g.term ? 'focus' : ''}`}>
            <dt>
              {g.term}
              <span className="reading">{g.reading}</span>
            </dt>
            <dd>
              <p className="g-plain">{g.plain}</p>
              {precise && <p className="g-precise">定義：{g.precise}</p>}
              <a className="g-link" href={`#/ch/${g.chapter}`}>→ 第{chapterById[g.chapter].num}章 {chapterById[g.chapter].title}</a>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// ───────── 公式集 ─────────
export function FormulaPage() {
  const groups = [...new Set(formulas.map((f) => f.group))]
  return (
    <div className="page">
      <div className="title-row"><h1>公式集 ― 根拠と適用条件つき</h1><PrintBtn /></div>
      <p className="lead">公式は「どの原理から出てくるか」「いつ使ってよいか」とセットで覚えましょう。定性的な性質や公式を言葉だけで覚えると、適用条件を見誤りやすくなります。</p>
      {groups.map((g) => (
        <section key={g} className="formula-group">
          <h2>{g}</h2>
          <div className="formula-list">
            {formulas.filter((f) => f.group === g).map((f) => (
              <div key={f.name} className="formula">
                <div className="formula-name">{f.name}</div>
                <div className="formula-tex"><Tex tex={f.tex} display /></div>
                <dl className="formula-meta">
                  <div><dt>根拠</dt><dd>{f.basis}</dd></div>
                  <div><dt>条件</dt><dd>{f.cond}</dd></div>
                </dl>
                <a className="g-link" href={`#/ch/${f.chapter}`}>→ 第{chapterById[f.chapter].num}章</a>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
