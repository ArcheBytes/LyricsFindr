import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, type PanInfo } from 'motion/react'

export interface CarouselItem {
  id: number
  artworkUrl: string | null
  gradient: string
  trackName: string
  artistName: string
}

interface Props {
  items: CarouselItem[]
  autoplayDelay?: number
  pauseOnHover?: boolean
}

const CARD     = 340          // square card px
const CONT_W   = 1600         // carousel container width
const REFLECT  = 120          // reflection height
const BG       = '#12121a'    // hero bg color — reflection fades into this

const VELOCITY_THRESHOLD = 500
const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 }

// x value of the track when card at `pos` is centered
function xAt(pos: number) {
  return CONT_W / 2 - CARD / 2 - pos * CARD
}

// ── Individual cover card ─────────────────────────────────────────────────────
function CoverCard({ item, index, x, zIndex }: {
  item: CarouselItem
  index: number
  x: ReturnType<typeof useMotionValue<number>>
  zIndex: number
}) {
  const cx = xAt(index)
  const rotateY = useTransform(x, [cx - CARD, cx, cx + CARD], [55, 0, -55], { clamp: false })
  const scale   = useTransform(x, [cx - CARD, cx, cx + CARD], [0.88, 1.04, 0.88], { clamp: false })

  const face = item.artworkUrl
    ? <img src={item.artworkUrl} alt="" className="w-full h-full object-cover select-none" draggable={false} />
    : <div className={`w-full h-full bg-linear-to-br ${item.gradient}`} />

  return (
    <motion.div
      style={{
        width: CARD,
        height: CARD + REFLECT + 6,
        flexShrink: 0,
        rotateY,
        scale,
        transformPerspective: 1400,
        zIndex,
        cursor: 'inherit',
      }}
    >
      {/* Card face */}
      <div style={{ width: CARD, height: CARD, borderRadius: 10, overflow: 'hidden', boxShadow: '0 12px 50px rgba(0,0,0,0.8)' }}>
        {face}
      </div>

      {/* Reflection */}
      <div style={{ width: CARD, height: REFLECT, marginTop: 6, overflow: 'hidden', position: 'relative' }}>
        {/* Flipped content – `bottom:0` so the bottom of the card (= top of reflection) is shown */}
        <div style={{ position: 'absolute', bottom: 0, width: CARD, height: CARD, transform: 'scaleY(-1)' }}>
          {face}
        </div>
        {/* Gradient fades reflection into background */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(18,18,26,0.15) 0%, ${BG} 85%)` }} />
      </div>
    </motion.div>
  )
}

// ── Main carousel ─────────────────────────────────────────────────────────────
export default function SongCarousel({ items, autoplayDelay = 5000, pauseOnHover = true }: Props) {
  const itemsForRender = useMemo(() => {
    if (items.length === 0) return []
    return [items[items.length - 1], ...items, items[0]]
  }, [items])

  const [position, setPosition]   = useState(1)
  const [isJumping, setIsJumping] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(xAt(1))

  // Sync x when items change (placeholder → real)
  useEffect(() => {
    setPosition(1)
    x.set(xAt(1))
  }, [items.length, x])

  // Autoplay – always advances; onAnimationComplete handles the seamless jump
  useEffect(() => {
    if (itemsForRender.length <= 1) return
    if (pauseOnHover && isHovered) return
    const t = setInterval(() => {
      setPosition(p => p + 1)
    }, autoplayDelay)
    return () => clearInterval(t)
  }, [autoplayDelay, isHovered, itemsForRender.length, pauseOnHover])

  // Pause on hover
  useEffect(() => {
    if (!pauseOnHover || !containerRef.current) return
    const el = containerRef.current
    const enter = () => setIsHovered(true)
    const leave = () => setIsHovered(false)
    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    return () => { el.removeEventListener('mouseenter', enter); el.removeEventListener('mouseleave', leave) }
  }, [pauseOnHover])

  const effectiveTransition = isJumping ? { duration: 0 } : SPRING

  function onAnimationStart() { setIsAnimating(true) }

  function onAnimationComplete() {
    if (itemsForRender.length <= 1) { setIsAnimating(false); return }
    const last = itemsForRender.length - 1
    if (position === last) {
      setIsJumping(true)
      setPosition(1); x.set(xAt(1))
      requestAnimationFrame(() => { setIsJumping(false); setIsAnimating(false) })
      return
    }
    if (position === 0) {
      setIsJumping(true)
      const t = items.length; setPosition(t); x.set(xAt(t))
      requestAnimationFrame(() => { setIsJumping(false); setIsAnimating(false) })
      return
    }
    setIsAnimating(false)
  }

  function onDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const { offset, velocity } = info
    const dir =
      offset.x < 0 || velocity.x < -VELOCITY_THRESHOLD ? 1
      : offset.x > 0 || velocity.x > VELOCITY_THRESHOLD ? -1
      : 0
    if (dir === 0) return
    setPosition(p => Math.max(0, Math.min(p + dir, itemsForRender.length - 1)))
  }

  function go(dir: 1 | -1) {
    setPosition(p => Math.max(0, Math.min(p + dir, itemsForRender.length - 1)))
  }

  return (
    <div
      ref={containerRef}
      className="absolute"
      style={{ width: CONT_W, top: '50%', left: '50%', transform: `translate(-50%, calc(-50% - ${REFLECT / 2}px))` }}
    >
      {/* Track */}
      <motion.div
        className="flex"
        drag={isAnimating ? false : 'x'}
        dragConstraints={{ left: xAt(itemsForRender.length - 1), right: xAt(0) }}
        style={{ x, cursor: 'grab', height: CARD + REFLECT + 6 }}
        animate={{ x: xAt(position) }}
        transition={effectiveTransition}
        onDragEnd={onDragEnd}
        onAnimationStart={onAnimationStart}
        onAnimationComplete={onAnimationComplete}
        whileDrag={{ cursor: 'grabbing' }}
      >
        {itemsForRender.map((item, i) => (
          <CoverCard
            key={`${item.id}-${i}`}
            item={item}
            index={i}
            x={x}
            zIndex={Math.max(1, 20 - Math.abs(i - position) * 4)}
          />
        ))}
      </motion.div>

      {/* Arrows */}
      <button
        onClick={() => go(-1)}
        className="absolute -left-20 w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center hover:border-white transition-colors"
        style={{ top: CARD / 2 - 24 }}
      >←</button>
      <button
        onClick={() => go(1)}
        className="absolute -right-20 w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center hover:border-white transition-colors"
        style={{ top: CARD / 2 - 24 }}
      >→</button>
    </div>
  )
}
