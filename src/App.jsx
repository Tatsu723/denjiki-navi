import { useEffect, useRef, useState } from 'react'
import { useRoute, go } from './lib/router.js'
import { chapterById, parts } from './content/index.js'
import { HomePage, ChapterPage, FaqListPage, FaqDetailPage, SearchPage, GlossaryPage, FormulaPage } from './pages.jsx'

function Header({ onMenu, route }) {
  const [q, setQ] = useState(route.page === 'search' ? route.query.q || '' : '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (route.page === 'search') setQ(route.query.q || '')
  }, [route.page, route.query.q])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const submit = (e) => {
    e.preventDefault()
    if (q.trim()) go(`#/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="メニュー">☰</button>
      <a href="#/" className="brand">
        <span className="brand-mark" aria-hidden>⚡</span>
        <span className="brand-text">電磁気ナビ</span>
      </a>
      <form className="search-form" onSubmit={submit} role="search">
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="キーワードで検索（例：起電力 向き）  /"
          aria-label="教材内を検索"
        />
      </form>
    </header>
  )
}

function Sidebar({ open, onClose, route }) {
  const current = route.page === 'ch' ? route.a : null
  const nav = [
    ['#/', 'ホーム', 'home'],
    ['#/faq', 'よくある質問 Q&A', 'faq'],
    ['#/formulas', '公式集（根拠と条件）', 'formulas'],
    ['#/glossary', '用語集', 'glossary'],
  ]
  return (
    <>
      <div className={`scrim ${open ? 'show' : ''}`} onClick={onClose} />
      <nav className={`sidebar ${open ? 'open' : ''}`} aria-label="目次">
        <ul className="nav-main">
          {nav.map(([href, label, page]) => (
            <li key={href}>
              <a href={href} className={route.page === page ? 'active' : ''} onClick={onClose}>{label}</a>
            </li>
          ))}
        </ul>
        {parts.map((part) => (
          <div key={part.title} className="nav-part">
            <div className="nav-part-title">{part.title}</div>
            <ul>
              {part.ids.map((id) => {
                const ch = chapterById[id]
                return (
                  <li key={id}>
                    <a href={`#/ch/${id}`} className={current === id ? 'active' : ''} onClick={onClose}>
                      <span className="nav-num">{ch.num}</span>
                      <span className="nav-title">{ch.title}</span>
                      {ch.emphasis && <span className="nav-star" title="重点">重点</span>}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  )
}

function Main() {
  const route = useRoute()
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    if (!(route.page === 'ch' && route.b)) window.scrollTo(0, 0)
  }, [route.page, route.a, route.b])

  let content
  switch (route.page) {
    case 'ch':
      content = chapterById[route.a] ? <ChapterPage chapter={chapterById[route.a]} sectionId={route.b} /> : <NotFound />
      break
    case 'faq':
      content = route.a ? <FaqDetailPage id={route.a} /> : <FaqListPage query={route.query} />
      break
    case 'search':
      content = <SearchPage q={route.query.q || ''} kind={route.query.kind} />
      break
    case 'glossary':
      content = <GlossaryPage focus={route.a} />
      break
    case 'formulas':
      content = <FormulaPage />
      break
    case 'home':
      content = <HomePage />
      break
    default:
      content = <NotFound />
  }

  return (
    <div className="shell">
      <Header onMenu={() => setMenu((v) => !v)} route={route} />
      <div className="layout">
        <Sidebar open={menu} onClose={() => setMenu(false)} route={route} />
        <main className="main" id="main">{content}</main>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="page">
      <h1>ページが見つかりません</h1>
      <p><a href="#/">ホームへ戻る</a></p>
    </div>
  )
}

export default function App() {
  return <Main />
}

