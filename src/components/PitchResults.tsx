import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Copy,
  Check,
  Pencil,
  Sparkles,
  Lightbulb,
  ThumbsUp,
  Star,
  X,
} from 'lucide-react'
import type { PitchResult, PitchOption } from '@/lib/pitchGenerator'
import { toast } from 'sonner'

function badgeVariantForIndex(i: number) {
  if (i < 0) return 'outline'
  return i === 0 ? 'default' : i === 1 ? 'secondary' : 'outline'
}

const TONE_LABELS = ['Warm & Personal', 'Task-Focused', 'Curious & Consultative']

interface PitchCardProps {
  option: PitchOption
  index: number
  isRecommended: boolean
  onSaveFinal?: (text: string) => void
}

function PitchCard({ option, index, isRecommended, onSaveFinal }: PitchCardProps) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(option.pitch)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Pitch copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
    onSaveFinal?.(text)
  }

  const handleToggleEdit = () => {
    if (editing && text !== option.pitch) {
      // Committing edit — save final
      onSaveFinal?.(text)
    }
    setEditing(!editing)
  }

  return (
    <Card
      className={`group relative transition-shadow duration-200 hover:shadow-md ${
        isRecommended ? 'ring-2 ring-primary/50' : ''
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-4">
          <Badge className="gap-1 bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            <Star className="h-3 w-3 fill-primary-foreground" />
            Recommended
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={badgeVariantForIndex(index)} className="text-[10px]">
                Option {index + 1}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {TONE_LABELS[index]}
              </span>
            </div>
            <CardTitle className="text-lg font-serif">{option.title}</CardTitle>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleEdit}
              className="h-8 w-8 p-0"
              aria-label="Edit pitch"
            >
              {editing ? (
                <X className="h-4 w-4" />
              ) : (
                <Pencil className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0"
              aria-label="Copy pitch"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pitch text — editable or read-only */}
        {editing ? (
          <textarea
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        ) : (
          <p className="text-sm leading-relaxed text-foreground">{text}</p>
        )}

        {/* Explanation */}
        <div className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3">
          <p className="text-xs leading-relaxed text-accent-foreground">
            <span className="font-semibold">Why this works: </span>
            {option.explanation}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface PitchResultsProps {
  result: PitchResult
  onFinalPitchSaved?: (text: string) => void
}

export function PitchResults({ result, onFinalPitchSaved }: PitchResultsProps) {
  const { options, coachingFeedback, revisedPitch, recommendedOption } = result

  const recommendedIndex = ((): number | null => {
    switch (recommendedOption.selectedPitchType) {
      case 'option_a':
        return 0
      case 'option_b':
        return 1
      case 'option_c':
        return 2
      default:
        return null
    }
  })()

  return (
    <section className="px-4 pb-24">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* Section header */}
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/50 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent-foreground">
            <ThumbsUp className="h-3.5 w-3.5" />
            Results
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Your Pitches Are Ready
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Three different approaches, plus coaching feedback to help you grow.
          </p>
        </div>

        {/* ── 3 Pitch Cards ── */}
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1">
          {options.map((option, i) => (
            <PitchCard
              key={i}
              option={option}
              index={i}
              isRecommended={recommendedIndex === i}
              onSaveFinal={onFinalPitchSaved}
            />
          ))}
        </div>

        {/* ── Coaching Feedback ── */}
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent-foreground" />
              <CardTitle className="font-serif text-lg">Coaching Feedback</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">
              {coachingFeedback}
            </p>
          </CardContent>
        </Card>

        {/* ── Revised Pitch ── */}
        {recommendedOption.selectedPitchType === 'revised' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                <Star className="h-3.5 w-3.5 fill-primary" />
                Recommended: Revised Version
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {recommendedOption.reason}
              </p>
            </div>
            <PitchCard
              option={revisedPitch}
              index={3}
              isRecommended={true}
              onSaveFinal={onFinalPitchSaved}
            />
          </div>
        )}

        {/* If recommendation points to one of the original options */}
        {recommendedIndex !== null && (
          <div className="rounded-xl border border-accent/40 bg-accent/5 p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {recommendedOption.selectedTitle}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {recommendedOption.reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Revised pitch — only show separately when NOT already the recommended one */}
        {recommendedOption.selectedPitchType !== 'revised' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-serif text-xl font-semibold text-foreground">
                Revised Pitch
              </h3>
              <Badge variant="secondary" className="text-[10px]">
                Strengthened Version
              </Badge>
            </div>
            <PitchCard
              option={revisedPitch}
              index={-1}
              isRecommended={false}
              onSaveFinal={onFinalPitchSaved}
            />
          </div>
        )}
      </div>
    </section>
  )
}
