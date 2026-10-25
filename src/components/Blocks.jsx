import { Rich, Tex } from './Rich.jsx'
import { Figure } from '../figures/index.jsx'

const BOX_META = {
  key: { label: '大原則', icon: '◆' },
  point: { label: '着眼点', icon: '◎' },
  warn: { label: 'よくある誤解', icon: '!' },
  tip: { label: 'コツ', icon: '✓' },
  adv: { label: '発展（読み飛ばしOK）', icon: '+' },
  def: { label: '定義', icon: '≡' },
  summary: { label: 'まとめ', icon: '■' },
}

function Box({ b }) {
  const meta = BOX_META[b.variant] || BOX_META.point
  const body = (
    <div className="box-body">
      <Blocks blocks={b.body} />
    </div>
  )
  if (b.variant === 'adv') {
    return (
      <details className={`box box-${b.variant}`}>
        <summary className="box-head">
          <span className="box-tag"><span aria-hidden>{meta.icon}</span>{meta.label}</span>
          {b.title && <span className="box-title"><Rich text={b.title} /></span>}
        </summary>
        {body}
      </details>
    )
  }
  return (
    <aside className={`box box-${b.variant}`}>
      <div className="box-head">
        <span className="box-tag"><span aria-hidden>{meta.icon}</span>{meta.label}</span>
        {b.title && <span className="box-title"><Rich text={b.title} /></span>}
      </div>
      {body}
    </aside>
  )
}

function Block({ b }) {
  if (typeof b === 'string') return <p><Rich text={b} /></p>
  switch (b.type) {
    case 'p':
      return <p><Rich text={b.text} /></p>
    case 'h':
      return <h4 className="subhead"><Rich text={b.text} /></h4>
    case 'math':
      return (
        <div className="math-wrap">
          <Tex tex={b.tex} display />
          {b.caption && <div className="caption">{b.caption}</div>}
        </div>
      )
    case 'list': {
      const Tag = b.ordered ? 'ol' : 'ul'
      return (
        <Tag className="rich-list">
          {b.items.map((it, i) => (
            <li key={i}>{typeof it === 'string' ? <Rich text={it} /> : <Block b={it} />}</li>
          ))}
        </Tag>
      )
    }
    case 'steps':
      return (
        <ol className="steps">
          {b.steps.map((s, i) => (
            <li key={i}>
              <div className="step-num">{i + 1}</div>
              <div className="step-content">
                <div className="step-title"><Rich text={s.title} /></div>
                <Blocks blocks={s.body} />
              </div>
            </li>
          ))}
        </ol>
      )
    case 'table':
      return (
        <div className="table-wrap">
          <table>
            {b.head && (
              <thead>
                <tr>{b.head.map((c, i) => <th key={i}><Rich text={c} /></th>)}</tr>
              </thead>
            )}
            <tbody>
              {b.rows.map((row, i) => (
                <tr key={i}>{row.map((c, j) => (j === 0 && b.head ? <th scope="row" key={j}><Rich text={c} /></th> : <td key={j}><Rich text={c} /></td>))}</tr>
              ))}
            </tbody>
          </table>
          {b.caption && <div className="caption">{b.caption}</div>}
        </div>
      )
    case 'fig':
      return <Figure name={b.name} caption={b.caption} />
    case 'qa':
      return (
        <div className="inline-qa">
          <div className="inline-q"><span className="qa-mark">Q</span><Rich text={b.q} /></div>
          <div className="inline-a"><span className="qa-mark a">A</span><div><Blocks blocks={b.a} /></div></div>
        </div>
      )
    case 'box':
      return <Box b={b} />
    default:
      return null
  }
}

export function Blocks({ blocks }) {
  if (!blocks) return null
  return blocks.map((b, i) => <Block key={i} b={b} />)
}
