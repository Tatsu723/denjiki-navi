// コンテンツ記述用の小さなDSL
// リッチテキスト記法：$TeX$ / **太字** / ==強調(赤)== / [[ch:章id|表示]] / [[faq:id|表示]] / [[g:用語]]

// タグ付きテンプレート（p`...$\\frac{a}{b}$...`）でも普通の文字列でも呼べるようにする
const R = (x, ...v) => (Array.isArray(x) && x.raw ? String.raw(x, ...v) : x)
export const r = String.raw

export const p = (...a) => ({ type: 'p', text: R(...a) })
export const h = (...a) => ({ type: 'h', text: R(...a) })
export const m = (...a) => (Array.isArray(a[0]) && a[0].raw ? { type: 'math', tex: R(...a) } : { type: 'math', tex: a[0], caption: a[1] })
export const list = (items, ordered = false) => ({ type: 'list', items, ordered })
export const steps = (...items) => ({ type: 'steps', steps: items.map(([title, ...body]) => ({ title, body })) })
export const table = (head, rows, caption) => ({ type: 'table', head, rows, caption })
export const fig = (name, caption) => ({ type: 'fig', name, caption })
export const qa = (q, ...a) => ({ type: 'qa', q, a })

// variant: key(大原則) / point(着眼点) / warn(よくある誤解) / tip(コツ) / adv(発展・読み飛ばしOK) / def(定義) / summary(まとめ)
export const box = (variant, title, ...body) => ({ type: 'box', variant, title, body })
export const key = (title, ...body) => box('key', title, ...body)
export const point = (title, ...body) => box('point', title, ...body)
export const warn = (title, ...body) => box('warn', title, ...body)
export const tip = (title, ...body) => box('tip', title, ...body)
export const adv = (title, ...body) => box('adv', title, ...body)
export const def = (title, ...body) => box('def', title, ...body)
export const summary = (title, ...body) => box('summary', title, ...body)
