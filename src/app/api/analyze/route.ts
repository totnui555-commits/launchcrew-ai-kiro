// LaunchCrew AI — Analyze API Endpoint
// POST /api/analyze  { idea: "your business idea" }
//
// Streams results as newline-delimited JSON (NDJSON). Each agent's section
// is sent the moment it resolves, so the frontend can populate cards
// progressively instead of waiting for all agents to finish.

import { NextRequest, NextResponse } from "next/server"
import {
  analyzePositioning,
  analyzeBusinessModel,
  analyzeBrandDirection,
  analyzeMarketingApproach,
  analyzePricing,
  generateNextSteps,
} from "@/lib/ai"

type SectionKey =
  | "positioning"
  | "businessModel"
  | "brandDirection"
  | "marketingApproach"
  | "pricing"
  | "nextSteps"

export async function POST(request: NextRequest) {
  let idea: string

  try {
    const body = await request.json()
    idea = body.idea
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    )
  }

  if (!idea || typeof idea !== "string") {
    return NextResponse.json(
      { error: "Please provide a business idea." },
      { status: 400 },
    )
  }

  if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY or OPENROUTER_API_KEY is not set. Add it to .env.local" },
      { status: 500 },
    )
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // Each agent runs independently. As soon as one resolves we enqueue
      // its result; Promise.allSettled waits until every agent is done so
      // we can close the stream cleanly.
      const agents: { key: SectionKey; fn: () => Promise<unknown> }[] = [
        { key: "positioning", fn: () => analyzePositioning(idea) },
        { key: "businessModel", fn: () => analyzeBusinessModel(idea) },
        { key: "brandDirection", fn: () => analyzeBrandDirection(idea) },
        { key: "marketingApproach", fn: () => analyzeMarketingApproach(idea) },
        { key: "pricing", fn: () => analyzePricing(idea) },
        { key: "nextSteps", fn: () => generateNextSteps(idea) },
      ]

      await Promise.allSettled(
        agents.map(async ({ key, fn }) => {
          try {
            const data = await fn()
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ section: key, data }) + "\n",
              ),
            )
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Agent failed."
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ section: key, error: message }) + "\n",
              ),
            )
          }
        }),
      )

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
    },
  })
}
