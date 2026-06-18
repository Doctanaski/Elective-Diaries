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
const FOCUS_SPRING: SpringOptions = { stiffness: 200, damping: 28, mass: 0.8 }

// How many px of movement distinguishes a tap from a drag
const TAP_THRESHOLD = 6

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  focused?: boolean
  onTap?: () => void
}

export function DraggableCardBody({ children, className = '', style, focused, onTap }: CardProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Drag position — raw values, spring-smoothed for rendering
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, SPRING)
  const y = useSpring(rawY, SPRING)

  // When focused: animate to screen center via separate spring-driven translate
  const focusX = useSpring(useMotionValue(0), FOCUS_SPRING)
  const focusY = useSpring(useMotionValue(0), FOCUS_SPRING)

  // Tilt while dragging
  const rotateX = useSpring(useMotionValue(0), SPRING)
  const rotateY = useSpring(useMotionValue(0), SPRING)

  const [dragging, setDragging] = useState(false)
  // Track pointer-down position to detect tap vs drag
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)
  const dragOrigin = useRef({ x: 0, y: 0 })

  // ── Compute center-of-viewport offset from card's current DOM position ──
  const getFocusOffset = useCallback(() => {
    if (!ref.current) return { fx: 0, fy: 0 }
    const rect = ref.current.getBoundingClientRect()
    const cardCX = rect.left + rect.width / 2
    const cardCY = rect.top + rect.height / 2
    const vpCX = window.innerWidth / 2
    const vpCY = window.innerHeight / 2
    return { fx: vpCX - cardCX, fy: vpCY - cardCY }
  }, [])

  // When `focused` changes, spring the card to center (or back)
  React.useEffect(() => {
    if (focused) {
      const { fx, fy } = getFocusOffset()
      focusX.set(fx)
      focusY.set(fy)
    } else {
      focusX.set(0)
      focusY.set(0)
    }
  }, [focused, focusX, focusY, getFocusOffset])

  // ── Mouse handlers ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (focused) return // don't drag while focused
    e.preventDefault()
    pointerDownPos.current = { x: e.clientX, y: e.clientY }
    dragOrigin.current = { x: e.clientX - rawX.get(), y: e.clientY - rawY.get() }
    setDragging(true)
  }, [focused, rawX, rawY])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return
    rawX.set(e.clientX - dragOrigin.current.x)
    rawY.set(e.clientY - dragOrigin.current.y)
    // Subtle tilt
    const dx = e.clientX - (pointerDownPos.current?.x ?? e.clientX)
    const dy = e.clientY - (pointerDownPos.current?.y ?? e.clientY)
    rotateY.set(dx * 0.04)
    rotateX.set(-dy * 0.04)
  }, [dragging, rawX, rawY, rotateX, rotateY])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    setDragging(false)
    rotateX.set(0)
    rotateY.set(0)
    // Tap detection
    if (pointerDownPos.current) {
      const dx = Math.abs(e.clientX - pointerDownPos.current.x)
      const dy = Math.abs(e.clientY - pointerDownPos.current.y)
      if (dx < TAP_THRESHOLD && dy < TAP_THRESHOLD) onTap?.()
    }
    pointerDownPos.current = null
  }, [rotateX, rotateY, onTap])

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
    if (focused) return
    const t = e.touches[0]
    pointerDownPos.current = { x: t.clientX, y: t.clientY }
    dragOrigin.current = { x: t.clientX - rawX.get(), y: t.clientY - rawY.get() }
    setDragging(true)
  }, [focused, rawX, rawY])

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
    // Tap detection
    if (pointerDownPos.current && e.changedTouches.length > 0) {
      const t = e.changedTouches[0]
      const dx = Math.abs(t.clientX - pointerDownPos.current.x)
      const dy = Math.abs(t.clientY - pointerDownPos.current.y)
      if (dx < TAP_THRESHOLD && dy < TAP_THRESHOLD) onTap?.()
    }
    pointerDownPos.current = null
  }, [rotateX, rotateY, onTap])

  return (
    <motion.div
      ref={ref}
      className={`select-none ${focused ? 'cursor-zoom-out' : 'cursor-grab active:cursor-grabbing'} ${className}`}
      style={{
        ...style,
        x,
        y,
        rotateX: focused ? 0 : rotateX,
        rotateY: focused ? 0 : rotateY,
        translateX: focusX,
        translateY: focusY,
        zIndex: focused ? 100 : dragging ? 40 : undefined,
        perspective: 800,
        transformStyle: 'preserve-3d',
      }}
      animate={focused
        ? { scale: 2.2, filter: 'brightness(1.1) drop-shadow(0 24px 48px rgba(0,0,0,0.7))' }
        : { scale: 1, filter: 'brightness(1) drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }
      }
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </motion.div>
  )
}
