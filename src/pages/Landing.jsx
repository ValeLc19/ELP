import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Landing.css'

// Blur-to-sharp fade-in. Each phrase reuses this and only differs by `delay`,
// so the sequence is: left (0) -> right (1) -> middle (2).
const phrase = {
  hidden: { opacity: 0, filter: 'blur(14px)', y: 10 },
  show: (delay) => ({
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <main className="landing">
      <motion.p
        className="bubble bubble--left"
        variants={phrase}
        custom={0.3}
        initial="hidden"
        animate="show"
      >
        Every event around El Paso,
        <br />
        in one place.
      </motion.p>

      <motion.p
        className="bubble bubble--right"
        variants={phrase}
        custom={1.5}
        initial="hidden"
        animate="show"
      >
        You don&apos;t have to know anybody
        <br />
        to belong here. Just show up
      </motion.p>

      <motion.button
        type="button"
        className="bubble bubble--center bubble--cta"
        variants={phrase}
        custom={2.7}
        initial="hidden"
        animate="show"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/events')}
      >
        See what&apos;s happening
      </motion.button>
    </main>
  )
}
