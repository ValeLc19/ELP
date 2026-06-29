import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Landing.css'

const ease = [0.22, 1, 0.36, 1]

// Each phrase animates in two beats:
//   1. the white pill slides in (from `from`)
//   2. the text fades/de-blurs in, after the pill has arrived
function Phrase({ className, from, pillDelay, onClick, children }) {
  const pill = {
    initial: { opacity: 0, ...from },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: { duration: 0.7, delay: pillDelay, ease },
  }
  const text = {
    initial: { opacity: 0, filter: 'blur(8px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    transition: { duration: 0.6, delay: pillDelay + 0.6, ease },
  }

  const inner = (
    <motion.span className="bubble__text" {...text}>
      {children}
    </motion.span>
  )

  if (onClick) {
    return (
      <motion.button
        type="button"
        className={`${className} bubble--cta`}
        onClick={onClick}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        {...pill}
      >
        {inner}
      </motion.button>
    )
  }

  return (
    <motion.div className={className} {...pill}>
      {inner}
    </motion.div>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <main className="landing">
      {/* left slides in from the left */}
      <Phrase className="bubble bubble--left" from={{ x: -80 }} pillDelay={0.3}>
        Every event around El Paso,
        <br />
        in one place.
      </Phrase>

      {/* right slides in from the right */}
      <Phrase className="bubble bubble--right" from={{ x: 80 }} pillDelay={1.7}>
        You don&apos;t have to know anybody
        <br />
        to belong here. Just show up
      </Phrase>

      {/* middle slides up from the bottom; clickable */}
      <Phrase
        className="bubble bubble--center"
        from={{ y: 60 }}
        pillDelay={3.1}
        onClick={() => navigate('/events')}
      >
        See what&apos;s happening
      </Phrase>
    </main>
  )
}
