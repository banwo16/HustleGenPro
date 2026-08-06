import { createFileRoute, Link } from '@tanstack/react-router'
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary'
import { PitchHistory } from '@/components/PitchHistory'

export const Route = createFileRoute('/history')({
  head: () => ({
    meta: [
      { title: 'Pitch History · HustleGenPro' },
      {
        name: 'description',
        content: 'Review your past pitch generations and saved pitches.',
      },
    ],
  }),
  component: HistoryPage,
})

function HistoryPage() {
  return (
    <BlinkClientBoundary
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ring" />
        </div>
      }
    >
      <PitchHistory />
    </BlinkClientBoundary>
  )
}
