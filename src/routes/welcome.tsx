import { createFileRoute } from '@tanstack/react-router'
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary'
import { Landing } from '@/components/Landing'

export const Route = createFileRoute('/welcome')({
  head: () => ({
    meta: [
      { title: 'HustleGenPro — Pitch Coaching for Your First Freelance Client' },
      {
        name: 'description',
        content:
          'Write client pitches that actually get replies, even with zero experience. Personalized coaching feedback for beginner freelancers landing their first client.',
      },
    ],
  }),
  component: WelcomePage,
})

function WelcomePage() {
  return (
    <BlinkClientBoundary
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ring" />
        </div>
      }
    >
      <Landing />
    </BlinkClientBoundary>
  )
}