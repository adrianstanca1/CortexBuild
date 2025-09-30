# Open Lovable

Chat with AI to build React apps instantly. An example app made by the [Firecrawl](https://firecrawl.dev/?ref=open-lovable-github) team. For a complete cloud solution, check out [Lovable.dev](https://lovable.dev/) ❤️.

<img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmZtaHFleGRsMTNlaWNydGdianI4NGQ4dHhyZjB0d2VkcjRyeXBucCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZFVLWMa6dVskQX0qu1/giphy.gif" alt="Open Lovable Demo" width="100%"/>

## Setup

1. **Clone & Install**

```bash
git clone https://github.com/firecrawl/open-lovable.git
cd open-lovable
pnpm install  # or npm install / yarn install
```

1. **Add `.env.local`**

```env
# Required
FIRECRAWL_API_KEY=your_firecrawl_api_key  # Get from https://firecrawl.dev (Web scraping)

# Vercel Sandbox Authentication (choose one method)
# See: https://vercel.com/docs/vercel-sandbox#authentication

# Method 1: OIDC Token (recommended for development)
# Run `vercel link` then `vercel env pull` to get VERCEL_OIDC_TOKEN automatically
VERCEL_OIDC_TOKEN=auto_generated_by_vercel_env_pull

# Method B: Personal Access Token (for production or when OIDC unavailable)
# VERCEL_TEAM_ID=team_xxxxxxxxx      # Your Vercel team ID 
# VERCEL_PROJECT_ID=prj_xxxxxxxxx    # Your Vercel project ID
# VERCEL_TOKEN=vercel_xxxxxxxxxxxx   # Personal access token from Vercel dashboard

# Option 2: E2B Sandbox
# E2B_API_KEY=e2b_bc242d5b133f04d63edcf40a28ac29b114cade7e      # https://e2b.dev
```

3. **Run**

```bash
pnpm dev  # or npm run dev / yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## License

MIT