import { useEffect, useRef } from 'react'
import { useTheme } from '@/stores/theme'

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 0
    const GRID_SIZE = 40

    let gridWidth = 0
    let gridHeight = 0
    let travelers: any[] = []

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      gridWidth = Math.ceil(width / GRID_SIZE)
      gridHeight = Math.ceil(height / GRID_SIZE)
      
      travelers = Array.from({ length: 40 }).map(() => ({
        gridX: Math.floor(Math.random() * gridWidth),
        gridY: Math.floor(Math.random() * gridHeight),
        targetX: 0,
        targetY: 0,
        progress: 0,
        speed: 0.015 + Math.random() * 0.02,
        delay: Math.random() * 120,
        moving: false
      }))
      
      travelers.forEach(t => {
        t.x = t.gridX * GRID_SIZE
        t.y = t.gridY * GRID_SIZE
        t.targetX = t.x
        t.targetY = t.y
      })
    }

    window.addEventListener('resize', resize)
    resize()

    const pickTarget = (t: any) => {
      const dir = Math.floor(Math.random() * 4)
      let nx = t.gridX
      let ny = t.gridY

      if (dir === 0) nx += 1
      else if (dir === 1) nx -= 1
      else if (dir === 2) ny += 1
      else ny -= 1

      if (nx >= 0 && nx <= gridWidth && ny >= 0 && ny <= gridHeight) {
        t.gridX = nx
        t.gridY = ny
        t.targetX = nx * GRID_SIZE
        t.targetY = ny * GRID_SIZE
        t.moving = true
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      const dotColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'
      const activeDotColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)'
      const trailColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'

      // Draw static grid
      ctx.fillStyle = dotColor
      for (let x = 0; x <= width; x += GRID_SIZE) {
        for (let y = 0; y <= height; y += GRID_SIZE) {
          ctx.beginPath()
          ctx.arc(x, y, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Draw and update travelers
      travelers.forEach(t => {
        if (t.delay > 0) {
          t.delay--
          return
        }

        if (!t.moving) {
          pickTarget(t)
        } else {
          t.progress += t.speed
          if (t.progress >= 1) {
            t.progress = 0
            t.x = t.targetX
            t.y = t.targetY
            t.moving = false
            t.delay = Math.random() * 60
          }
        }

        const currentX = t.x + (t.targetX - t.x) * t.progress
        const currentY = t.y + (t.targetY - t.y) * t.progress

        // Draw trail
        if (t.moving) {
          ctx.beginPath()
          ctx.moveTo(t.x, t.y)
          ctx.lineTo(currentX, currentY)
          ctx.strokeStyle = trailColor
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // Draw active dot
        ctx.beginPath()
        ctx.arc(currentX, currentY, 2, 0, Math.PI * 2)
        ctx.fillStyle = activeDotColor
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1]"
    />
  )
}