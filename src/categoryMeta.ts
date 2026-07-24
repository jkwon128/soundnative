import type { QuizCategory } from './quizData'

export interface CategoryMeta {
  label: string
  icon: string
  color: string
}

// Material Symbols icon name + a swatch from the design system's restrained
// blue/teal/red palette (src/index.css @theme), shared by every screen that
// renders a category (home path, quest cards).
export const CATEGORY_META: Record<QuizCategory, CategoryMeta> = {
  errands: { label: '일상 심부름', icon: 'shopping_cart', color: '#0040df' },
  doctor: { label: '병원·관공서', icon: 'local_hospital', color: '#ba1a1a' },
  work: { label: '직장·회의', icon: 'work', color: '#006a66' },
  smalltalk: { label: '스몰토크', icon: 'forum', color: '#2d5bff' },
  school: { label: '학교', icon: 'school', color: '#00504d' },
  rent: { label: '렌트·이웃', icon: 'home', color: '#0035bd' },
}
