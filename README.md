# LaunchCrew AI

Turn your business idea into a structured plan — positioning, model, brand, marketing, pricing, and next steps — with one click.

## Quick Start

```bash
# 1. Install dependencies
cd launchcrew-ai
npm install

# 2. Add your OpenAI API key
cp .env.example .env.local
#   → Open .env.local and paste your API key

# 3. Run the app
npm run dev
#   → Opens at http://localhost:3000
```

## What It Does

1. You type a business idea (the more detail, the better)
2. AI specialists analyze it from multiple angles
3. You get a dashboard with:
   - **Positioning** — name, tagline, target market, competitive advantage
   - **Business Model** — revenue streams, resources, cost structure
   - **Brand Direction** — personality, tone, colors, typography
   - **Marketing** — channels, strategies, content ideas
   - **Pricing** — model, tiers, rationale
   - **Next Steps** — actionable checklist to launch

## Tech Stack

| Tool | Purpose |
|---|---|
| Next.js 15 | Web framework (frontend + API) |
| TypeScript | Type-safe code |
| Tailwind CSS | Styling |
| OpenAI API | AI business analysis |
| Zod | Response validation |

All free / open-source. You only pay for your own OpenAI API usage.

## Project Structure

```
launchcrew-ai/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (fonts, metadata)
│   │   ├── page.tsx            # Main page (input + results)
│   │   ├── globals.css         # Tailwind + animations
│   │   └── api/
│   │       └── analyze/
│   │           └── route.ts    # POST endpoint → calls OpenAI
│   ├── lib/
│   │   └── ai.ts               # AI integration (prompt + validation)
│   └── types/
│       └── index.ts            # TypeScript types
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── SPEC.md                      # Full product spec & roadmap
```

## Getting an OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy it into `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

## Next Steps (Roadmap)

See `SPEC.md` for the full roadmap. The next version (v0.2) adds:
- Database to save business profiles
- Multiple AI agent calls (one per specialist role)
- Task management & approval workflow

## License

Private project. Not for distribution.
