import { intro, field, gauss, potential } from './ch_static.js'
import { conductor, capacitor, current, kirchhoff, emf } from './ch_circuit.js'
import { magnetic, induction, inductance, ac } from './ch_magnetic.js'
import { flow, maxwell } from './ch_flow.js'
import { faqs } from './faq.js'
import { glossary, formulas } from './reference.js'

export const chapters = [intro, field, gauss, potential, conductor, capacitor, current, kirchhoff, emf, magnetic, induction, inductance, ac, flow, maxwell]

export const parts = [
  { title: 'はじめに', ids: ['intro'] },
  { title: '静電気', ids: ['field', 'gauss', 'potential', 'conductor', 'capacitor'] },
  { title: '電気回路', ids: ['current', 'kirchhoff', 'emf'] },
  { title: '磁気と電磁誘導', ids: ['magnetic', 'induction', 'inductance', 'ac'] },
  { title: 'まとめ', ids: ['flow', 'maxwell'] },
]

export const chapterById = Object.fromEntries(chapters.map((c) => [c.id, c]))
export const faqById = Object.fromEntries(faqs.map((f) => [f.id, f]))

export { faqs, glossary, formulas }
