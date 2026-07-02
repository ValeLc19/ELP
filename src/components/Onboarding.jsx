import { useState, useLayoutEffect } from 'react'
import './Onboarding.css'

const STEPS = [
  {
    text: 'Add a local business’s social media account to pull in the events they post.',
    target: '[data-onb="add"]',
  },
  {
    text: 'Now you can save the events you are interested in.',
    target: '[data-onb="saved"]',
  },
]

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const [pos, setPos] = useState(null)
  const last = step === STEPS.length - 1

  // Anchor the callout's pointer under the icon this step is about.
  useLayoutEffect(() => {
    const place = () => {
      const el = document.querySelector(STEPS[step].target)
      if (!el) return setPos(null)
      const r = el.getBoundingClientRect()
      setPos({ cx: r.left + r.width / 2, top: r.bottom + 14 })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [step])

  // Card sits below the icon; its right edge is offset so the pointer (24px
  // from the card's right) lands under the icon's center.
  const cardStyle = pos
    ? { top: pos.top, right: Math.max(12, window.innerWidth - pos.cx - 34) }
    : { top: 84, right: 24 }

  return (
    <div className="onb" role="dialog" aria-modal="true">
      <div className="onb__backdrop" />
      <div className="onb__card" style={cardStyle}>
        <div className="onb__pointer" />
        <p className="onb__text">{STEPS[step].text}</p>
        <div className="onb__actions">
          <span className="onb__dots">
            {STEPS.map((_, i) => (
              <span key={i} className={`onb__dot ${i === step ? 'is-on' : ''}`} />
            ))}
          </span>
          <button
            className="onb__next"
            onClick={() => (last ? onDone() : setStep(step + 1))}
          >
            {last ? 'Got it' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
