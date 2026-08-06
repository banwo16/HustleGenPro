import { createFileRoute } from '@tanstack/react-router'
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary'
import { Pricing } from '@/components/Pricing'

export const Route = createFileRoute('/pricing')({
  head: () => ({
    meta: [
      { title: 'Pricing — HustleGenPro' },
      {
        name: 'description',
        content:
          'Free pitch coaching and a Pro plan in private beta. Built for first-time freelancers landing their first client.',
      },
    ],
  }),
  component: PricingPage,
})

function PricingPage() {
  return (
    <BlinkClientBoundary
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ring" />
        </div>
      }
    >
      <Pricing />
    </BlinkClientBoundary>
  )
}