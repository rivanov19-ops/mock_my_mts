import { useState, useEffect, useCallback } from 'react'

const VALID_CODE = '1234'
const TIMER_SECONDS = 60

export function useOtpTimer() {
  const [seconds, setSeconds] = useState(TIMER_SECONDS)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (seconds <= 0) {
      setCanResend(true)
      return
    }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seconds])

  const reset = useCallback(() => {
    setSeconds(TIMER_SECONDS)
    setCanResend(false)
  }, [])

  const validate = useCallback((code: string) => code === VALID_CODE, [])

  return { seconds, canResend, reset, validate }
}
