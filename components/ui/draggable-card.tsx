'use client'

import React, { useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, type SpringOptions } from 'motion/react'

// ── DraggableCardContainer ────────────────────────────────────────────────────

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export function DraggableCardContainer({ children, className = '' }: ContainerProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  )
}

// ── DraggableCardBody ─────────────────────────────────────────────────────────

const SPRING: SpringOptions = { stiffness: 260, damping: 24, mass: 0.6 }

// How many px of movement distinguishes a tap from a drag
const TAP_THRESHOLD = 6

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onOpen?: () => void   // called after the tap-pop animation finishes
}

export function DraggableCardBody({ children, className = '', style, onOpen }: CardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, SPRING)
  const y = useSpring(rawY, SPRING)

  const rotateX = useSpring(useMotionValue(0), SPRING)
  const rotateY = useSpring(useMotionValue(0), SPRING)

  const [dragging, setDragging] = useState(false)
  const [popping, setPopping] = useState(false)
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)
  const dragOrigin = useRef({ x: 0, y: 0 })

  // ── Mouse handlers ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    pointerDownPos.current = { x: e.clientX, y: e.clientY }
    dragOrigin.current = { x: e.clientX - rawX.get(), y: e.clientY - rawY.get() }
    setDragging(true)
  }, [rawX, rawY])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return
    rawX.set(e.clientX - dragOrigin.current.x)
    rawY.set(e.clientY - dragOrigin.current.y)
    const dx = e.clientX - (pointerDownPos.current?.x ?? e.clientX)
    const dy = e.clientY - (pointerDownPos.current?.y ?? e.clientY)
    rotateY.set(dx * 0.04)
    rotateX.set(-dy * 0.04)
  }, [dragging, rawX, rawY, rotateX, rotateY])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    setDragging(false)
    rotateX.set(0)
    rotateY.set(0)
    if (pointerDownPos.current) {
      const dx = Math.abs(e.clientX - pointerDownPos.current.x)
      const dy = Math.abs(e.clientY - pointerDownPos.current.y)
      if (dx < TAP_THRESHOLD && dy < TAP_THRESHOLD) {
        // Pop animation, then open viewer
        setPopping(true)
      }
    }
    pointerDownPos.current = null
  }, [rotateX, rotateY])

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, handleMouseMove, handleMouseUp])

  // ── Touch handlers ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    pointerDownPos.current = { x: t.clientX, y: t.clientY }
    dragOrigin.current = { x: t.clientX - rawX.get(), y: t.clientY - rawY.get() }
    setDragging(true)
  }, [rawX, rawY])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return
    e.preventDefault()
    const t = e.touches[0]
    rawX.set(t.clientX - dragOrigin.current.x)
    rawY.set(t.clientY - dragOrigin.current.y)
  }, [dragging, rawX, rawY])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    setDragging(false)
    rotateX.set(0)
    rotateY.set(0)
    if (pointerDownPos.current && e.changedTouches.length > 0) {
      const t = e.changedTouches[0]
      const dx = Math.abs(t.clientX - pointerDownPos.current.x)
      const dy = Math.abs(t.clientY - pointerDownPos.current.y)
      if (dx < TAP_THRESHOLD && dy < TAP_THRESHOLD) {
        setPopping(true)
      }
    }
    pointerDownPos.current = null
  }, [rotateX, rotateY])

  return (
    <motion.div
      ref={ref}
      className={`select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{
        ...style,
        x,
        y,
        rotateX,
        rotateY,
        zIndex: popping ? 50 : dragging ? 40 : undefined,
        perspective: 800,
        transformStyle: 'preserve-3d',
      }}
      animate={popping
        ? { scale: 1.18, filter: 'brightness(1.15)' }
        : { scale: 1,    filter: 'brightness(1)' }
      }
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => {
        if (popping) {
          setPopping(false)
          onOpen?.()
        }
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </motion.div>
  )
}
