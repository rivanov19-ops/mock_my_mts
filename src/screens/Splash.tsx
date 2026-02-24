import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Доброе утро!'
  if (h < 18) return 'Добрый день!'
  return 'Добрый вечер!'
}

// Each letter flies in from the center of the screen to its corner.
// `initial` offsets are relative to the final absolute position.
const letterVariants = {
  М: { initial: { x: 140,  y: 300, opacity: 0 }, animate: { x: 0, y: 0, opacity: 1 } },
  Т: { initial: { x: -140, y: 300, opacity: 0 }, animate: { x: 0, y: 0, opacity: 1 } },
  С: { initial: { x: -140, y: -300, opacity: 0 }, animate: { x: 0, y: 0, opacity: 1 } },
}

const spring = { type: 'spring', stiffness: 180, damping: 22 }

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const id = setTimeout(() => navigate('/login', { replace: true }), 2200)
    return () => clearTimeout(id)
  }, [navigate])

  return (
    <div className="min-h-screen bg-mts-red flex justify-center">
      <div className="relative w-full max-w-app min-h-screen overflow-hidden">

        {/* М — top-left */}
        <motion.span
          className="absolute top-8 left-5 text-white font-black select-none"
          style={{ fontSize: '9rem', lineHeight: 1 }}
          initial={letterVariants.М.initial}
          animate={letterVariants.М.animate}
          transition={spring}
        >
          М
        </motion.span>

        {/* Т — top-right */}
        <motion.span
          className="absolute top-8 right-5 text-white font-black select-none"
          style={{ fontSize: '9rem', lineHeight: 1 }}
          initial={letterVariants.Т.initial}
          animate={letterVariants.Т.animate}
          transition={spring}
        >
          Т
        </motion.span>

        {/* С — bottom-right */}
        <motion.span
          className="absolute bottom-16 right-5 text-white font-black select-none"
          style={{ fontSize: '9rem', lineHeight: 1 }}
          initial={letterVariants.С.initial}
          animate={letterVariants.С.animate}
          transition={spring}
        >
          С
        </motion.span>

        {/* Greeting — bottom-left */}
        <motion.span
          className="absolute bottom-16 left-5 text-white font-bold text-2xl select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          {getGreeting()}
        </motion.span>

      </div>
    </div>
  )
}
