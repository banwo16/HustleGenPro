import { createFileRoute } from '@tanstack/react-router'
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary'
import { PitchCoach } from '@/components/PitchCoach'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'HustleGenPro — AI Pitch Coach for Beginner Freelancers' },
      {
        name: 'description',
        content:
          'Generate personalized, confidence-building pitch options for your next freelance gig. Built for first-time freelancers landing their first client.',
      },
    ],
  }),
  component: Home,
})

function Home() {
  return (
    <BlinkClientBoundary fallback={<AuthLoadingShell />}>
      <PitchCoach />
    </BlinkClientBoundary>
  )
}

function AuthLoadingShell() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ring" />
    </div>
  )
}
