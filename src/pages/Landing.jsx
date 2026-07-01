import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroMap from '../components/HeroMap.jsx'
import './Landing.css'

// Pick the map's mood from the current hour (matches the design):
// 7–17 day, 17–20 sunset, otherwise night. No manual toggle.
function timeOfDay() {
  const h = new Date().getHours()
  if (h >= 7 && h < 17) return 'day'
  if (h >= 17 && h < 20) return 'sunset'
  return 'night'
}

export default function Landing() {
  const navigate = useNavigate()
  const mode = timeOfDay()
  const [leaving, setLeaving] = useState(false)

  // Slowly fade the landing away, then navigate to the events page.
  const explore = () => {
    if (leaving) return
    setLeaving(true)
    setTimeout(() => navigate('/events'), 1300)
  }

  return (
    <div className={`landing ${leaving ? 'landing--leaving' : ''}`}>
      {/* living map background (cover + slow drift) */}
      <div className="landing__map">
        <div className="landing__map-pan">
          <HeroMap timeOfDay={mode} showTitle={false} showLabels showPeople />
        </div>
      </div>

      {/* soft warmth from the top so copy always reads */}
      <div className="landing__warmth" />

      {/* TITLE panel (bleeds off left) */}
      <div className="epc landing__title">
        <div className="landing__panel-text">
          Every event around El&nbsp;Paso,
          <br />
          in one place.
        </div>
      </div>

      {/* MIDDLE line (bleeds off right, right-aligned) */}
      <div className="epc landing__middle">
        <div className="landing__panel-text">
          You don&apos;t have to know anybody
          <br />
          to belong here. Just show&nbsp;up.
        </div>
      </div>

      {/* CTA */}
      <div className="epc landing__cta-wrap">
        <button className="landing__cta" onClick={explore}>
          See what&apos;s happening
        </button>
      </div>
    </div>
  )
}
