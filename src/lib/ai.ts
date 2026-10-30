// LaunchCrew AI — AI Integration
// Five specialist agents, each with its own OpenAI call and system prompt.
// Results are assembled into a single BusinessAnalysis by the API route.

import OpenAI from "openai"
import { z } from "zod"
import type {
  Positioning,
  BusinessModel,
  BrandDirection,
  MarketingApproach,
  Pricing,
} from "@/types"

// Supports both OpenAI and OpenRouter (drop-in compatible via baseURL)
// Set OPENROUTER_API_KEY in .env.local to use OpenRouter free models
const isOpenRouter = !!process.env.OPENROUTER_API_KEY

const openai = new OpenAI({
  apiKey: isOpenRouter
    ? process.env.OPENROUTER_API_KEY
    : process.env.OPENAI_API_KEY,
  baseURL: isOpenRouter
    ? "https://openrouter.ai/api/v1"
    : undefined,
  defaultHeaders: isOpenRouter
    ? { "HTTP-Referer": "http://localhost:3001", "X-Title": "LaunchCrew AI" }
    : undefined,
})

// OpenRouter free model: meta-llama/llama-3.1-8b-instruct:free
// OpenAI default: gpt-4o
const MODEL = process.env.OPENAI_MODEL || (isOpenRouter
  ? "meta-llama/llama-3.1-8b-instruct:free"
  : "gpt-4o")

// ── Per-section Zod schemas ──────────────────────────────────────

const positioningSchema = z.object({
  businessName: z.string(),
  tagline: z.string(),
  description: z.string(),
  targetMarket: z.string(),
  uniqueValueProposition: z.string(),
  competitiveAdvantage: z.string(),
})

const businessModelSchema = z.object({
  type: z.string(),
  revenueStreams: z.array(z.string()),
  keyResources: z.array(z.string()),
  keyActivities: z.array(z.string()),
  keyPartners: z.array(z.string()),
  costStructure: z.array(z.string()),
  customerSegments: z.array(z.string()),
})

const brandDirectionSchema = z.object({
  personality: z.array(z.string()),
  tone: z.string(),
  visualStyle: z.string(),
  colorSuggestions: z.array(z.string()),
  typography: z.string(),
})

const marketingApproachSchema = z.object({
  channels: z.array(z.string()),
  strategies: z.array(z.string()),
  contentIdeas: z.array(z.string()),
  customerAcquisition: z.array(z.string()),
})

const pricingTierSchema = z.object({
  name: z.string(),
  price: z.string(),
  features: z.array(z.string()),
})

const pricingSchema = z.object({
  model: z.string(),
  tiers: z.array(pricingTierSchema),
  rationale: z.string(),
})

const nextStepsSchema = z.array(z.string())

// ── Helper: call OpenAI with a JSON-only system prompt ────────────

async function callAgent<T>(
  systemPrompt: string,
  idea: string,
  schema: z.ZodType<T>,
  maxTokens = 1200,
): Promise<T> {
  if (!idea.trim()) {
    throw new Error("Business idea cannot be empty")
  }

  if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENAI_API_KEY or OPENROUTER_API_KEY is not set. Add it to .env.local")
  }

  // OpenRouter doesn't support response_format: json_object for all models —
  // instruct via system prompt only and rely on Zod validation.
  const useResponseFormat = !isOpenRouter

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: idea },
    ],
    ...(useResponseFormat ? { response_format: { type: "json_object" as const } } : {}),
    temperature: 0.7,
    max_tokens: maxTokens,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error("No response content from AI")
  }

  const parsed = JSON.parse(content)
  return schema.parse(parsed)
}

// ── Agent 1: Positioning ──────────────────────────────────────────

const POSITIONING_PROMPT = `You are a business strategy specialist. Analyze the user's business idea and determine its market positioning.

Return ONLY valid JSON with this exact structure:
{
  "businessName": "a memorable, available-sounding business name",
  "tagline": "short memorable tagline (max 8 words)",
  "description": "1-2 sentence business description",
  "targetMarket": "specific target customer description",
  "uniqueValueProposition": "what makes this different from alternatives",
  "competitiveAdvantage": "key sustainable advantage"
}

Rules:
- Return ONLY valid JSON, no markdown or extra text
- Be specific and practical, not generic
- Tailor everything to the specific business idea`

export async function analyzePositioning(idea: string): Promise<Positioning> {
  return callAgent(POSITIONING_PROMPT, idea, positioningSchema)
}

// ── Agent 2: Business Model ───────────────────────────────────────

const BUSINESS_MODEL_PROMPT = `You are a business model and finance specialist. Analyze the user's business idea and design the optimal business model.

Return ONLY valid JSON with this exact structure:
{
  "type": "e.g. B2B SaaS, D2C e-commerce, marketplace, service, etc.",
  "revenueStreams": ["stream 1", "stream 2"],
  "keyResources": ["resource 1"],
  "keyActivities": ["activity 1"],
  "keyPartners": ["partner type 1"],
  "costStructure": ["cost category 1"],
  "customerSegments": ["segment 1"]
}

Rules:
- Return ONLY valid JSON, no markdown or extra text
- Provide 2-3 revenue streams
- Be realistic about costs, competition, and challenges
- Tailor everything to the specific business idea`

export async function analyzeBusinessModel(idea: string): Promise<BusinessModel> {
  return callAgent(BUSINESS_MODEL_PROMPT, idea, businessModelSchema)
}

// ── Agent 3: Brand Direction ──────────────────────────────────────

const BRAND_PROMPT = `You are a brand strategy and visual identity specialist. Analyze the user's business idea and recommend a brand direction.

Return ONLY valid JSON with this exact structure:
{
  "personality": ["trait 1", "trait 2", "trait 3"],
  "tone": "brand voice description",
  "visualStyle": "visual direction (clean, bold, playful, etc.)",
  "colorSuggestions": ["#hex1", "#hex2", "#hex3"],
  "typography": "font style recommendation"
}

Rules:
- Return ONLY valid JSON, no markdown or extra text
- Use real hex color codes in colorSuggestions (3-5 colors)
- Provide exactly 3 personality traits
- Tailor everything to the specific business idea`

export async function analyzeBrandDirection(idea: string): Promise<BrandDirection> {
  return callAgent(BRAND_PROMPT, idea, brandDirectionSchema)
}

// ── Agent 4: Marketing Approach ───────────────────────────────────

const MARKETING_PROMPT = `You are a marketing and growth specialist. Analyze the user's business idea and recommend a marketing approach.

Return ONLY valid JSON with this exact structure:
{
  "channels": ["channel 1", "channel 2"],
  "strategies": ["strategy 1"],
  "contentIdeas": ["content idea 1"],
  "customerAcquisition": ["method 1"]
}

Rules:
- Return ONLY valid JSON, no markdown or extra text
- Provide 2-4 channels, strategies, content ideas, and acquisition methods
- Be specific and practical, not generic
- Tailor everything to the specific business idea`

export async function analyzeMarketingApproach(idea: string): Promise<MarketingApproach> {
  return callAgent(MARKETING_PROMPT, idea, marketingApproachSchema)
}

// ── Agent 5: Pricing ──────────────────────────────────────────────

const PRICING_PROMPT = `You are a pricing and monetization specialist. Analyze the user's business idea and recommend a pricing strategy.

Return ONLY valid JSON with this exact structure:
{
  "model": "freemium, subscription, one-time, usage-based, etc.",
  "tiers": [
    { "name": "tier name", "price": "price description", "features": ["feature 1"] }
  ],
  "rationale": "why this pricing approach fits"
}

Rules:
- Return ONLY valid JSON, no markdown or extra text
- Provide 2-4 pricing tiers with 2-5 features each
- Be realistic about what customers will pay
- Tailor everything to the specific business idea`

export async function analyzePricing(idea: string): Promise<Pricing> {
  return callAgent(PRICING_PROMPT, idea, pricingSchema)
}

// ── Agent 6: Next Steps ────────────────────────────────────────────
// Small companion call that completes the BusinessAnalysis type.

const NEXT_STEPS_PROMPT = `You are an operations and execution specialist. Given the user's business idea, provide 5-7 specific, actionable next steps to launch it.

Return ONLY valid JSON with this exact structure:
{
  "nextSteps": ["actionable step 1", "step 2", "step 3", "step 4", "step 5"]
}

Rules:
- Return ONLY valid JSON, no markdown or extra text
- Provide 5-7 steps that are specific, practical, and ordered
- Each step should be one clear action
- Tailor everything to the specific business idea`

export async function generateNextSteps(idea: string): Promise<string[]> {
  if (!idea.trim()) {
    throw new Error("Business idea cannot be empty")
  }

  if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENAI_API_KEY or OPENROUTER_API_KEY is not set. Add it to .env.local")
  }

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: NEXT_STEPS_PROMPT },
      { role: "user", content: idea },
    ],
    ...(isOpenRouter ? {} : { response_format: { type: "json_object" as const } }),
    temperature: 0.7,
    max_tokens: 600,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error("No response content from AI")
  }

  const parsed = JSON.parse(content)
  return nextStepsSchema.parse(parsed.nextSteps)
}
