// LaunchCrew AI — Type Definitions
// These types define the shape of a business analysis returned by the AI.

export interface Positioning {
  businessName: string
  tagline: string
  description: string
  targetMarket: string
  uniqueValueProposition: string
  competitiveAdvantage: string
}

export interface BusinessModel {
  type: string
  revenueStreams: string[]
  keyResources: string[]
  keyActivities: string[]
  keyPartners: string[]
  costStructure: string[]
  customerSegments: string[]
}

export interface BrandDirection {
  personality: string[]
  tone: string
  visualStyle: string
  colorSuggestions: string[] // hex codes
  typography: string
}

export interface MarketingApproach {
  channels: string[]
  strategies: string[]
  contentIdeas: string[]
  customerAcquisition: string[]
}

export interface PricingTier {
  name: string
  price: string
  features: string[]
}

export interface Pricing {
  model: string
  tiers: PricingTier[]
  rationale: string
}

export interface BusinessAnalysis {
  positioning: Positioning
  businessModel: BusinessModel
  brandDirection: BrandDirection
  marketingApproach: MarketingApproach
  pricing: Pricing
  nextSteps: string[]
}

// Request body for POST /api/analyze
export interface AnalyzeRequest {
  idea: string
}
