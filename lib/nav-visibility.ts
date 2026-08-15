type Listener = () => void

let hidden = false
const listeners = new Set<Listener>()

export function subscribeNavVisibility(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getNavVisibility() {
  return hidden
}

export function setNavVisibility(next: boolean) {
  if (hidden === next) return
  hidden = next
  listeners.forEach((listener) => listener())
}
