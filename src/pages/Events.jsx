import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

// Placeholder for the "next step" after the landing CTA.
// This is where the events feed will live.
export default function Events() {
  const navigate = useNavigate()

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <motion.h1
        initial={{ opacity: 0, filter: 'blur(14px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', margin: 0 }}
      >
        Events feed — coming next.
      </motion.h1>
      <button
        type="button"
        onClick={() => navigate('/')}
        style={{
          fontFamily: 'inherit',
          fontSize: '1.2rem',
          background: 'var(--cream)',
          border: 'none',
          borderRadius: '999px',
          padding: '0.8rem 2rem',
          cursor: 'pointer',
        }}
      >
        ← Back
      </button>
    </main>
  )
}
