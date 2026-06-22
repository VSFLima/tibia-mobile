export class SoundManager {
    private context: AudioContext | null = null
    private enabled = true

    init(): void {
        try {
            this.context = new AudioContext()
        } catch {
            console.warn('AudioContext not available')
        }
    }

    play(sound: string): void {
        if (!this.enabled || !this.context) return
        try {
            if (this.context.state === 'suspended') {
                this.context.resume()
            }
            const osc = this.context.createOscillator()
            const gain = this.context.createGain()
            osc.connect(gain)
            gain.connect(this.context.destination)

            const sounds: Record<string, { freq: number; duration: number; type: OscillatorType }> = {
                step: { freq: 100, duration: 0.05, type: 'sine' },
                hit: { freq: 200, duration: 0.1, type: 'square' },
                miss: { freq: 80, duration: 0.15, type: 'sawtooth' },
                heal: { freq: 523, duration: 0.2, type: 'sine' },
                levelup: { freq: 659, duration: 0.3, type: 'sine' },
                victory: { freq: 440, duration: 0.5, type: 'triangle' },
                defeat: { freq: 110, duration: 0.8, type: 'sawtooth' },
                portal: { freq: 880, duration: 0.3, type: 'sine' },
                gold: { freq: 1200, duration: 0.1, type: 'square' },
                death: { freq: 60, duration: 1, type: 'sawtooth' },
                spell: { freq: 1000, duration: 0.2, type: 'sine' },
                buy: { freq: 800, duration: 0.15, type: 'triangle' },
                sell: { freq: 600, duration: 0.15, type: 'triangle' },
                quest: { freq: 700, duration: 0.4, type: 'sine' }
            }

            const s = sounds[sound] || sounds.step
            osc.type = s.type
            osc.frequency.setValueAtTime(s.freq, this.context.currentTime)
            gain.gain.setValueAtTime(0.1, this.context.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + s.duration)
            osc.start(this.context.currentTime)
            osc.stop(this.context.currentTime + s.duration)
        } catch {
            // Audio error
        }
    }

    toggle(): void {
        this.enabled = !this.enabled
    }
}
