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
    let trails: any[] = []

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      gridWidth = Math.ceil(width / GRID_SIZE)
      gridHeight = Math.ceil(height / GRID_SIZE)
      
      travelers = Array.from({ length: 35 }).map(() => ({
        gridX: Math.floor(Math.random() * gridWidth),
        gridY: Math.floor(Math.random() * gridHeight),
        targetX: 0,
        targetY: 0,
        progress: 0,
        speed: 0.02 + Math.random() * 0.02,
        delay: Math.random() * 100,
        moving: false,
        startX: 0,
        startY: 0
      }))
      
      travelers.forEach(t => {
        t.x = t.gridX * GRID_SIZE
        t.y = t.gridY * GRID_SIZE
        t.targetX = t.x
        t.targetY = t.y
        t.startX = t.x
        t.startY = t.y
      })
      trails = []
    }

    window.addEventListener('resize', resize)
    resize()

    const pickTarget = (t: any) => {
      const dir = Math.floor(Math.random() * 4)
      const distance = Math.floor(Math.random() * 3) + 1 // move 1 to 3 grid units
      let nx = t.gridX
      let ny = t.gridY

      if (dir === 0) nx += distance
      else if (dir === 1) nx -= distance
      else if (dir === 2) ny += distance
      else ny -= distance

      if (nx >= 0 && nx <= gridWidth && ny >= 0 && ny <= gridHeight) {
        t.gridX = nx
        t.gridY = ny
        t.startX = t.x
        t.startY = t.y
        t.targetX = nx * GRID_SIZE
        t.targetY = ny * GRID_SIZE
        t.moving = true
        t.progress = 0
      }
    }

    const render = () => {
      // Fill canvas with the background color so body can be transparent
      ctx.fillStyle = isDark ? '#0a0a0a' : '#f5f5f7'
      ctx.fillRect(0, 0, width, height)

      const dotColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'
      const activeDotColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)'
      const trailColorFunc = (alpha: number) => isDark ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha})`

      // Draw static grid
      ctx.fillStyle = dotColor
      for (let x = 0; x <= width; x += GRID_SIZE) {
        for (let y = 0; y <= height; y += GRID_SIZE) {
          ctx.beginPath()
          ctx.arc(x, y, 1.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Process and draw fading trails
      for (let i = trails.length - 1; i >= 0; i--) {
        const tr = trails[i]
        tr.life -= 0.02
        if (tr.life <= 0) {
          trails.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.moveTo(tr.startX, tr.startY)
        ctx.lineTo(tr.endX, tr.endY)
        ctx.strokeStyle = trailColorFunc(tr.life * 0.4)
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Draw and update travelers
      travelers.forEach(t => {
        if (t.delay > 0) {
          t.delay--
          // Draw resting dot
          ctx.beginPath()
          ctx.arc(t.x, t.y, 2, 0, Math.PI * 2)
          ctx.fillStyle = activeDotColor
          ctx.fill()
          return
        }

        if (!t.moving) {
          pickTarget(t)
        } else {
          t.progress += t.speed
          if (t.progress >= 1) {
            t.progress = 1
            // Save trail
            trails.push({
              startX: t.startX,
              startY: t.startY,
              endX: t.targetX,
              endY: t.targetY,
              life: 1.0
            })
            
            t.x = t.targetX
            t.y = t.targetY
            t.moving = false
            t.delay = Math.random() * 150
          }
        }

        const currentX = t.startX + (t.targetX - t.startX) * t.progress
        const currentY = t.startY + (t.targetY - t.startY) * t.progress

        // Draw active trail extending
        if (t.moving) {
          ctx.beginPath()
          ctx.moveTo(t.startX, t.startY)
          ctx.lineTo(currentX, currentY)
          ctx.strokeStyle = trailColorFunc(0.4)
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // Draw active moving dot
        ctx.beginPath()
        ctx.arc(currentX, currentY, 2, 0, Math.PI * 2)
        ctx.fillStyle = activeDotColor
        ctx.fill()
        
        // Also draw the origin dot while moving
        if (t.moving) {
          ctx.beginPath()
          ctx.arc(t.startX, t.startY, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = activeDotColor
          ctx.fill()
        }
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
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}