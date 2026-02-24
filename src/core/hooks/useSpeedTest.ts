import { useState, useCallback } from 'react'

interface SpeedTestResult {
  download: number
  upload: number
  ping: number
}

const MOCK_RESULT: SpeedTestResult = { download: 48.3, upload: 12.1, ping: 24 }
const TEST_DURATION_MS = 5000
const TICK_MS = 100

export function useSpeedTest() {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<SpeedTestResult | null>(null)

  const start = useCallback(() => {
    setRunning(true)
    setResult(null)
    setProgress(0)

    let elapsed = 0
    const tick = setInterval(() => {
      elapsed += TICK_MS
      setProgress(Math.min(elapsed / TEST_DURATION_MS, 1))
      if (elapsed >= TEST_DURATION_MS) {
        clearInterval(tick)
        setRunning(false)
        setResult(MOCK_RESULT)
      }
    }, TICK_MS)
  }, [])

  return { running, progress, result, start }
}
