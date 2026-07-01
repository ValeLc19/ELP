import { useState } from 'react'
import './Onboarding.css'

const STEPS = [
  {
    text: 'Add a local business’s social media account to pull in the events they post.',
  },
  {
    text: 'Now you can save the events you are interested in.',
  },
]

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const last = step === STEPS.length - 1

  return (
    <div className="onb" role="dialog" aria-modal="true">
      <div className="onb__backdrop" />
      <div className={`onb__card onb__card--${step}`}>
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
