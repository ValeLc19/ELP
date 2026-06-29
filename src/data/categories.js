// Event categories and their accent colors (matching the design's dots/badges).
export const CATEGORIES = {
  Food: '#d9534f',
  Music: '#5b7fd4',
  Arts: '#9b6fc7',
  Outdoors: '#6fae6f',
  Markets: '#e0b341',
  Sports: '#3aa6a0',
}

// Order shown in the filter row, plus the "All" option.
export const CATEGORY_ORDER = ['Food', 'Music', 'Arts', 'Outdoors', 'Markets', 'Sports']

export const ALL_COLOR = '#e0a83e'

export function categoryColor(name) {
  return CATEGORIES[name] || '#888'
}

// A translucent tint of a category color, for filled badges.
export function categoryTint(name, alpha = 0.4) {
  const hex = categoryColor(name).replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
