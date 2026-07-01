import { HERO_MAP_SVG } from './heroMapSvg.js'
import './HeroMap.css'

// Time-of-day themes, matching the design's Hero Map renderVals().
const THEMES = {
  day: {
    tintColor: '#FFFFFF',
    tintOpacity: 0,
    lightsOpacity: 0,
    sunOpacity: 1,
    labelColor: '#2C231D',
    sunTransform: 'translate(0,0)',
  },
  sunset: {
    tintColor: '#E3A035',
    tintOpacity: 0.12,
    lightsOpacity: 0.45,
    sunOpacity: 1,
    labelColor: '#2C231D',
    sunTransform: 'translate(-40,168)',
  },
  night: {
    tintColor: '#16233A',
    tintOpacity: 0.58,
    lightsOpacity: 1,
    sunOpacity: 0.12,
    labelColor: '#FBEAD0',
    sunTransform: 'translate(-40,168)',
  },
}

function fill(svg, vals) {
  return svg.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => String(vals[k] ?? ''))
}

export default function HeroMap({
  timeOfDay = 'sunset',
  showLabels = true,
  showPeople = true,
  showTitle = false,
}) {
  const t = THEMES[timeOfDay] || THEMES.sunset
  const svg = fill(HERO_MAP_SVG, {
    ...t,
    labelsDisplay: showLabels ? 'inline' : 'none',
    peopleDisplay: showPeople ? 'inline' : 'none',
    titleDisplay: showTitle ? 'inline' : 'none',
  })

  return (
    <div
      className="hero-map"
      // Static, design-authored SVG — no user input.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
