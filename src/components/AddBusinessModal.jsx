import { useState } from 'react'
import { XIcon } from './icons.jsx'
import './AddBusinessModal.css'

// Front-end stub: captures a business's social handle. Real pull-in of their
// posted events would need a backend integration.
export default function AddBusinessModal({ onClose }) {
  const [handle, setHandle] = useState('')
  const [done, setDone] = useState(false)

  return (
    <div className="biz" role="dialog" aria-modal="true">
      <div className="biz__backdrop" onClick={onClose} />
      <div className="biz__card">
        <button className="biz__close" onClick={onClose} aria-label="Close">
          <XIcon />
        </button>
        {done ? (
          <>
            <h2 className="biz__title">Thanks!</h2>
            <p className="biz__text">
              We’ll start pulling in events from <strong>{handle}</strong> soon.
            </p>
            <button className="biz__done" onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <h2 className="biz__title">Add a local business</h2>
            <p className="biz__text">
              Paste a business’s social media handle or page link and we’ll pull
              in the events they post.
            </p>
            <input
              className="biz__input"
              placeholder="@elpasomarket or a page link"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
            />
            <button
              className="biz__done"
              disabled={!handle.trim()}
              onClick={() => setDone(true)}
            >
              Add
            </button>
          </>
        )}
      </div>
    </div>
  )
}
