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

const SPRING: SpringOptions = { stiffness: 280, damping: 22, mass: 0.6 }

interface CardProps {
  children: React.ReactNode
  className?: string
  onFocus?: () => void
  focused?: boolean
}

export function DraggableCardBody({ children, className = '', onFocus, focused }: CardProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Position state
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, SPRING)
  const sy = useSpring(y, SPRING)

  // Tilt
  const rotateX = useSpring(useMotionValue(0), SPRING)
  const rotateY = useSpring(useMotionValue(0), SPRING)

  const [dragging, setDragging] = useState(false)
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    setDragOrigin({ x: e.clientX - x.get(), y: e.clientY - y.get() })
    onFocus?.()
  }, [x, y, onFocus])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return
    x.set(e.clientX - dragOrigin.x)
    y.set(e.clientY - dragOrigin.y)

    // Tilt based on drag velocity
    rotateY.set((e.clientX - dragOrigin.x - x.get()) * 0.05)
    rotateX.set(-(e.clientY - dragOrigin.y - y.get()) * 0.05)
  }, [dragging, dragOrigin, x, y, rotateX, rotateY])

  const handleMouseUp = useCallback(() => {
    setDragging(false)
    rotateX.set(0)
    rotateY.set(0)
  }, [rotateX, rotateY])

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (!dragging) {
      rotateX.set(0)
      rotateY.set(0)
    }
  }, [dragging, rotateX, rotateY])

  // Attach / detach global mousemove & mouseup
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

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    setDragging(true)
    setDragOrigin({ x: t.clientX - x.get(), y: t.clientY - y.get() })
    onFocus?.()
  }, [x, y, onFocus])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return
    e.preventDefault()
    const t = e.touches[0]
    x.set(t.clientX - dragOrigin.x)
    y.set(t.clientY - dragOrigin.y)
  }, [dragging, dragOrigin, x, y])

  const handleTouchEnd = useCallback(() => {
    setDragging(false)
  }, [])

  return (
    <motion.div
      ref={ref}
      className={`select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{
        x: sx,
        y: sy,
        rotateX,
        rotateY,
        zIndex: focused ? 50 : dragging ? 40 : undefined,
        perspective: 800,
        transformStyle: 'preserve-3d',
      }}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      whileHover={{ scale: focused ? 1 : 1.03 }}
      animate={focused
        ? { scale: 1.12, filter: 'brightness(1.08)' }
        : { scale: 1, filter: 'brightness(1)' }
      }
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  )
}
