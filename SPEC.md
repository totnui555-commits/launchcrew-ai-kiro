# LaunchCrew AI — Product Specification

## Vision

**"The Business That Runs Without You."**

LaunchCrew AI helps entrepreneurs turn business ideas into structured, operating businesses using coordinated AI agents. Users describe an idea and get a team of AI specialists that produce real deliverables — positioning, brand, marketing, pricing, operations.

## MVP Scope (v0.1) — "Business Idea Analyzer"

**Input:** User types a business idea
**Output:** Structured business analysis displayed as organized cards:
- Business positioning (name, tagline, target market, UVP)
- Business model (revenue streams, key resources, cost structure)
- Brand direction (personality, tone, visual style, colors)
- Marketing approach (channels, strategies, content ideas)
- Pricing suggestions (model, tiers, rationale)
- Next steps (actionable checklist)

**No database in v0.1** — generates on-the-fly, displays results in browser.

## Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Frontend + API | Next.js 15 (App Router) | Free |
| Language | TypeScript | Free |
| Styling | Tailwind CSS | Free |
| AI | OpenAI API (user's key) | Pay-per-use |
| Validation | Zod | Free |
| Hosting | Vercel / Render free tier | Free |

No paid dependencies. User pays only for their own OpenAI API usage.

## Roadmap

| Version | What's Added |
|---|---|
| **v0.1** | Business idea analyzer (this MVP) |
| v0.2 | Database — save & persist business profiles |
| v0.3 | Separate AI agent calls per specialist role |
| v0.4 | Task management & approval workflow |
| v0.5 | Multi-agent collaboration with shared context |
| v1.0 | Full platform: storefront setup, dashboards, automation |

## Architecture (v0.1)

```
User types idea → Next.js page → POST /api/analyze → OpenAI API
                                                        ↓
                                              Structured JSON
                                                        ↓
                                              Display as cards
```

## Agent Roles (Future Vision)

| Role | Responsibility |
|---|---|
| Chief of Staff | Coordination, task management |
| Business Strategy | Positioning, competitive analysis |
| Finance | Pricing, revenue model, cost structure |
| Branding | Brand identity, visual direction |
| Marketing | Channels, content, customer acquisition |
| Content Creation | Copy, product descriptions, ads |
| Sales Operations | Sales process, pipeline |
| Growth | Scaling, optimization |
| Design | UI/UX, visual assets |
| Business Operations | Day-to-day operations |

In v0.1, all roles are handled by a single AI call. v0.3+ separates them into independent agents.

## Design Principles

- Clean, minimal, Apple-inspired UI
- Premium SaaS aesthetic
- Mobile-responsive
- Accessible (WCAG-conscious)
- Fast load times

## Security

- OpenAI API key stored in `.env.local` — never exposed to client
- API routes run server-side only
- No user data sent to external services except OpenAI
- No authentication needed in v0.1 (local/single-user)

## Setup

```bash
cd launchcrew-ai
npm install
cp .env.example .env.local    # Add your OpenAI API key
npm run dev                   # Opens at localhost:3000
```
