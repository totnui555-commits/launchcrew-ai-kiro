"use client"

import { useState, useCallback } from "react"
import type {
  BusinessAnalysis,
  Positioning,
  BusinessModel,
  BrandDirection,
  MarketingApproach,
  Pricing,
} from "@/types"

// ── Per-section state ────────────────────────────────────────────

interface SectionState<T> {
  loading: boolean
  data: T | null
  error: string | null
}

interface AnalysisState {
  positioning: SectionState<Positioning>
  businessModel: SectionState<BusinessModel>
  brandDirection: SectionState<BrandDirection>
  marketingApproach: SectionState<MarketingApproach>
  pricing: SectionState<Pricing>
  nextSteps: SectionState<string[]>
}

const EMPTY_SECTIONS: AnalysisState = {
  positioning: { loading: false, data: null, error: null },
  businessModel: { loading: false, data: null, error: null },
  brandDirection: { loading: false, data: null, error: null },
  marketingApproach: { loading: false, data: null, error: null },
  pricing: { loading: false, data: null, error: null },
  nextSteps: { loading: false, data: null, error: null },
}

const LOADING_SECTIONS: AnalysisState = {
  positioning: { loading: true, data: null, error: null },
  businessModel: { loading: true, data: null, error: null },
  brandDirection: { loading: true, data: null, error: null },
  marketingApproach: { loading: true, data: null, error: null },
  pricing: { loading: true, data: null, error: null },
  nextSteps: { loading: true, data: null, error: null },
}

// ── Icons (inline SVG — no extra dependency) ──────────────────────

function Icon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    target: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M3 3v18h18" />
        <rect x="7" y="10" width="3" height="8" />
        <rect x="13" y="6" width="3" height="12" />
      </svg>
    ),
    palette: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="8" cy="10" r="1.2" fill="currentColor" />
        <circle cx="12" cy="7" r="1.2" fill="currentColor" />
        <circle cx="16" cy="10" r="1.2" fill="currentColor" />
        <path d="M12 21c1.5-2 4-2 4-4s-2-1.5-4-1.5" />
      </svg>
    ),
    megaphone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M3 11l14-7v16l-14-7z" />
        <path d="M3 11v4h3v-4z" />
      </svg>
    ),
    dollar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    rocket: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-3.16.09z" />
        <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
  }
  return <>{icons[name]}</>
}

// ── Helper Components ─────────────────────────────────────────────

function Card({
  icon,
  title,
  loading = false,
  error = null,
  delay = 0,
  children,
}: {
  icon: string
  title: string
  loading?: boolean
  error?: string | null
  delay?: number
  children: React.ReactNode
}) {
  return (
    <div
      className="animate-fade-in-up rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon name={icon} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {loading && (
          <span className="ml-auto animate-spin-slow h-4 w-4 rounded-full border-2 border-brand-200 border-t-brand-600" />
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <span className="text-sm text-gray-400">Agent analyzing…</span>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <div className="space-y-3 text-sm text-gray-700">{children}</div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="text-gray-800">{value}</p>
    </div>
  )
}

function List({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-700">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-brand-400" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Tags({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function ColorSwatches({ colors }: { colors: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div
            className="h-8 w-8 rounded-lg border border-gray-200"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-gray-500">{color}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────

export default function Home() {
  const [idea, setIdea] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sections, setSections] = useState<AnalysisState>(EMPTY_SECTIONS)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idea.trim()) return

    setStreaming(true)
    setSubmitted(true)
    setError(null)
    setSections(LOADING_SECTIONS)

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Analysis failed")
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No response stream")

      const decoder = new TextDecoder()
      let buffer = ""

      // Read NDJSON stream — each line is { section, data } or { section, error }
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split("\n")
        buffer = lines.pop() || "" // keep the trailing partial line

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const parsed = JSON.parse(line)
            const key = parsed.section as keyof AnalysisState

            setSections((prev) => ({
              ...prev,
              [key]: {
                loading: false,
                data: parsed.data ?? null,
                error: parsed.error ?? null,
              },
            }))
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setStreaming(false)
    }
  }, [idea])

  const handleReset = useCallback(() => {
    setSubmitted(false)
    setStreaming(false)
    setIdea("")
    setError(null)
    setSections(EMPTY_SECTIONS)
  }, [])

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <header className="mb-10 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="text-brand-600">
            <Icon name="rocket" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            LaunchCrew AI
          </h1>
        </div>
        <p className="text-base text-gray-600 sm:text-lg">
          Turn your idea into a business. Describe it once, get a full plan back.
        </p>
      </header>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your business idea... e.g. 'A subscription box service for healthy Thai snacks delivered monthly to office workers in Bangkok'"
            className="h-40 w-full resize-none border-0 p-5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0"
            disabled={streaming}
          />
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3">
            <p className="hidden text-xs text-gray-400 sm:block">
              The more detail you give, the better the analysis.
            </p>
            <button
              type="submit"
              disabled={streaming || !idea.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {streaming ? (
                <>
                  <span className="animate-spin-slow h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Idea
                  <span className="text-base">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Top-level error (fetch failure, bad request, etc.) */}
      {error && (
        <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p className="font-medium">Couldn&apos;t complete the analysis.</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Results — shown once the user submits */}
      {submitted && (
        <div className="space-y-6">
          {/* Row 1: Positioning + Business Model */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card
              icon="target"
              title="Positioning"
              delay={0}
              loading={sections.positioning.loading}
              error={sections.positioning.error}
            >
              {sections.positioning.data && (
                <>
                  <Field label="Business Name" value={sections.positioning.data.businessName} />
                  <Field label="Tagline" value={sections.positioning.data.tagline} />
                  <Field label="Description" value={sections.positioning.data.description} />
                  <Field label="Target Market" value={sections.positioning.data.targetMarket} />
                  <Field label="Unique Value" value={sections.positioning.data.uniqueValueProposition} />
                  <Field label="Competitive Advantage" value={sections.positioning.data.competitiveAdvantage} />
                </>
              )}
            </Card>

            <Card
              icon="chart"
              title="Business Model"
              delay={100}
              loading={sections.businessModel.loading}
              error={sections.businessModel.error}
            >
              {sections.businessModel.data && (
                <>
                  <Field label="Type" value={sections.businessModel.data.type} />
                  <List label="Revenue Streams" items={sections.businessModel.data.revenueStreams} />
                  <List label="Key Resources" items={sections.businessModel.data.keyResources} />
                  <List label="Key Activities" items={sections.businessModel.data.keyActivities} />
                  <List label="Customer Segments" items={sections.businessModel.data.customerSegments} />
                </>
              )}
            </Card>
          </div>

          {/* Row 2: Brand + Marketing */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card
              icon="palette"
              title="Brand Direction"
              delay={200}
              loading={sections.brandDirection.loading}
              error={sections.brandDirection.error}
            >
              {sections.brandDirection.data && (
                <>
                  <Tags label="Personality" items={sections.brandDirection.data.personality} />
                  <Field label="Tone" value={sections.brandDirection.data.tone} />
                  <Field label="Visual Style" value={sections.brandDirection.data.visualStyle} />
                  <Field label="Typography" value={sections.brandDirection.data.typography} />
                  <div>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Color Suggestions
                    </p>
                    <ColorSwatches colors={sections.brandDirection.data.colorSuggestions} />
                  </div>
                </>
              )}
            </Card>

            <Card
              icon="megaphone"
              title="Marketing Approach"
              delay={300}
              loading={sections.marketingApproach.loading}
              error={sections.marketingApproach.error}
            >
              {sections.marketingApproach.data && (
                <>
                  <List label="Channels" items={sections.marketingApproach.data.channels} />
                  <List label="Strategies" items={sections.marketingApproach.data.strategies} />
                  <List label="Content Ideas" items={sections.marketingApproach.data.contentIdeas} />
                  <List label="Customer Acquisition" items={sections.marketingApproach.data.customerAcquisition} />
                </>
              )}
            </Card>
          </div>

          {/* Row 3: Pricing + Next Steps */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card
              icon="dollar"
              title="Pricing"
              delay={400}
              loading={sections.pricing.loading}
              error={sections.pricing.error}
            >
              {sections.pricing.data && (
                <>
                  <Field label="Model" value={sections.pricing.data.model} />
                  <div className="space-y-2 pt-1">
                    {sections.pricing.data.tiers.map((tier, i) => (
                      <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800">{tier.name}</p>
                          <p className="text-brand-600 font-medium">{tier.price}</p>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {tier.features.map((f, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-gray-600">
                              <span className="mt-0.5 text-brand-400">✓</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <Field label="Rationale" value={sections.pricing.data.rationale} />
                </>
              )}
            </Card>

            <Card
              icon="check"
              title="Next Steps"
              delay={500}
              loading={sections.nextSteps.loading}
              error={sections.nextSteps.error}
            >
              {sections.nextSteps.data && (
                <ol className="space-y-2">
                  {sections.nextSteps.data.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-medium text-brand-600">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </div>

          {/* Start Over */}
          {!streaming && (
            <div className="text-center pt-4">
              <button
                onClick={handleReset}
                className="text-sm text-brand-600 hover:text-brand-700 hover:underline"
              >
                ← Analyze another idea
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-gray-400">
        LaunchCrew AI v0.1 — MVP
      </footer>
    </main>
  )
}
