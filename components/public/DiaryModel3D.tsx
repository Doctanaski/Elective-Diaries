'use client'

import { useState } from 'react'

interface Props {
  modelId: string
}

export default function DiaryModel3D({ modelId }: Props) {
  const [loaded, setLoaded] = useState(false)

  // Sketchfab embed URL with auto-spin, transparent bg, no UI chrome
  const src = [
    `https://sketchfab.com/models/${modelId}/embed`,
    '?autostart=1',
    '&autospin=0.3',
    '&ui_controls=0',
    '&ui_infos=0',
    '&ui_inspector=0',
    '&ui_stop=0',
    '&ui_watermark=0',
    '&ui_watermark_link=0',
    '&ui_ar=0',
    '&ui_help=0',
    '&ui_settings=0',
    '&ui_vr=0',
    '&ui_fullscreen=0',
    '&ui_annotations=0',
    '&transparent=1',
    '&dnt=1',
  ].join('')

  return (
    <div
      className="absolute right-0 top-1/2 -translate-y-1/2 z-10
                 pointer-events-none select-none
                 hidden lg:block"
      style={{ width: 420, height: 420 }}
    >
      {/* Shimmer while loading */}
      {!loaded && (
        <div className="absolute inset-0 rounded-full bg-surface-container-low animate-pulse opacity-30" />
      )}

      <iframe
        title="3D Model"
        src={src}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        className="w-full h-full border-0"
        style={{
          background: 'transparent',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
