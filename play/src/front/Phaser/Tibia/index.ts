import { TibiaGame } from './TibiaGame'

export function initTibiaGame(): TibiaGame {
    const canvas = document.getElementById('game') as HTMLCanvasElement
    if (!canvas) {
        throw new Error('Canvas element #game not found')
    }

    function resize() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    const game = new TibiaGame(canvas)

    // Game loop
    let lastTime = performance.now()

    function gameLoop(now: number) {
        const dt = Math.min((now - lastTime) / 1000, 0.1)
        lastTime = now

        game.update(dt)
        game.render()

        requestAnimationFrame(gameLoop)
    }

    requestAnimationFrame(gameLoop)

    // Hide loading screen
    setTimeout(() => {
        const loading = document.getElementById('loading')
        if (loading) {
            loading.style.opacity = '0'
            loading.style.transition = 'opacity 0.5s'
            setTimeout(() => loading.style.display = 'none', 500)
        }
    }, 800)

    console.log('Tibia Mobile v1.0 started!')
    return game
}
