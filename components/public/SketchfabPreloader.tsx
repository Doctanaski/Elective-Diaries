'use client'

// Mounts invisible Sketchfab iframes so the browser caches the models
// in the background while the user browses diaries on the hospital page.
// By the time they open a diary, the model is already loaded.

interface Props {
  modelIds: string[]
}

export default function SketchfabPreloader({ modelIds }: Props) {
  if (modelIds.length === 0) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      {modelIds.map((id) => (
        <iframe
          key={id}
          src={[
            `https://sketchfab.com/models/${id}/embed`,
            '?autostart=1',
            '&autospin=0',
            '&ui_controls=0',
            '&ui_infos=0',
            '&ui_watermark=0',
            '&ui_loading=0',
            '&transparent=1',
            '&preload=1',
            '&dnt=1',
          ].join('')}
          title={`preload-${id}`}
          allow="autoplay; fullscreen; xr-spatial-tracking"
          style={{ width: 1, height: 1, border: 'none' }}
        />
      ))}
    </div>
  )
}
