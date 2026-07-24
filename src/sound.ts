interface Tone {
  freq: number
  time: number
  duration: number
  type?: OscillatorType
}

function playTones(tones: Tone[]) {
  if (typeof window === 'undefined') return
  const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return

  const ctx = new AudioContextClass()
  const now = ctx.currentTime

  for (const { freq, time, duration, type = 'sine' } of tones) {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = type
    oscillator.frequency.value = freq
    gain.gain.setValueAtTime(0.15, now + time)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start(now + time)
    oscillator.stop(now + time + duration)
  }

  const totalDuration = Math.max(...tones.map((t) => t.time + t.duration))
  setTimeout(() => ctx.close(), (totalDuration + 0.1) * 1000)
}

// Short ascending two-note chime.
export function playCorrectSound() {
  playTones([
    { freq: 880, time: 0, duration: 0.12 },
    { freq: 1175, time: 0.1, duration: 0.2 },
  ])
}

// Short low buzz.
export function playIncorrectSound() {
  playTones([{ freq: 200, time: 0, duration: 0.22, type: 'square' }])
}
