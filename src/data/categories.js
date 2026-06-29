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
