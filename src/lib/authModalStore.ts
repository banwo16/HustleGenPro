/**
 * Minimal external store so any component can trigger the login modal with
 * a single function call — mirrors how `blink.auth.login()` used to work
 * (callable from anywhere, no context provider or prop drilling needed).
 *
 * Supabase has no equivalent "just open a hosted login page" helper, so we
 * render our own <AuthModal /> once at the root and control its visibility
 * through this tiny store instead.
 */

type Listener = (open: boolean) => void

let isOpen = false
const listeners = new Set<Listener>()

export function openAuthModal() {
  isOpen = true
  listeners.forEach((l) => l(isOpen))
}

export function closeAuthModal() {
  isOpen = false
  listeners.forEach((l) => l(isOpen))
}

export function subscribeAuthModal(listener: Listener): () => void {
  listeners.add(listener)
  listener(isOpen)
  return () => listeners.delete(listener)
}
