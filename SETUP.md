# Sprintify Setup Guide

This guide will walk you through setting up Sprintify for development.

## Prerequisites

Before you begin, ensure you have:
- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **pnpm** 8 or higher (Install: `npm install -g pnpm`)
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

## Step-by-Step Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd sprintify
```

### 2. Install dependencies

```bash
pnpm install
```

This will install dependencies for all workspaces (web and agent).

### 3. Set up environment variables

You need to create `.env.local` files with your OpenAI API key:

#### For the web app:

```bash
# Create .env.local in apps/web
cat > apps/web/.env.local << 'EOF'
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
EOF
```

#### For the agent:

```bash
# Create .env.local in apps/agent
cat > apps/agent/.env.local << 'EOF'
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
EOF
```

**Important:** Replace `sk-your-api-key-here` with your actual OpenAI API key.

### 4. Build the agent package

The agent needs to be built before the web app can use it:

```bash
cd apps/agent
pnpm build
cd ../..
```

### 5. Start the development server

Now you can start both applications:

```bash
pnpm dev
```

This will start:
- **Web app** at http://localhost:3000
- **Agent** in watch mode (rebuilds on changes)

## Testing the Application

### Quick Test

1. Open http://localhost:3000 in your browser
2. Paste the example requirements from `EXAMPLE_INPUT.md`
3. Click "Generate Tickets"
4. Wait ~10-30 seconds for AI processing
5. Review the generated tickets!

### Test with PDF

You can also upload a PDF file containing your requirements. The system supports:
- PDF files (up to 5MB)
- Plain text files (.txt)

## Troubleshooting

### Error: "Module not found: agent"

**Solution:** Build the agent package first:
```bash
cd apps/agent
pnpm build
```

### Error: "OPENAI_API_KEY is not set"

**Solution:** Make sure you've created `.env.local` files in both `apps/web` and `apps/agent` with your API key.

### Agent changes not reflected

**Solution:** The agent runs in watch mode, but you may need to restart:
```bash
# Stop the dev server (Ctrl+C)
cd apps/agent
pnpm build
cd ../..
pnpm dev
```

### Port 3000 already in use

**Solution:** Kill the process using port 3000 or specify a different port:
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Or use a different port
cd apps/web
PORT=3001 pnpm dev
```

### PDF parsing fails

**Solution:** Ensure the PDF is text-based (not scanned images). If you have scanned PDFs, consider using OCR first or paste the text directly.

## Development Tips

### Hot Reload

- **Web app**: Next.js automatically hot-reloads on file changes
- **Agent**: TypeScript compiles on save in watch mode

### Viewing Generated Data

Project states are saved in `data/projects/` as JSON files. You can inspect them:

```bash
cat data/projects/<project-id>.json | jq
```

### Changing the AI Model

Edit your `.env.local` files to use a different model:

```env
# Cheaper, faster (recommended for development)
OPENAI_MODEL=gpt-3.5-turbo

# Most capable (recommended for production)
OPENAI_MODEL=gpt-4-turbo-preview

# Latest (if available)
OPENAI_MODEL=gpt-4
```

### Cost Management

To reduce costs during development:
1. Use `gpt-3.5-turbo` for testing
2. Keep test documents small (1-2 pages)
3. Monitor costs in the UI's Cost Meter

## Production Deployment

### Build for production

```bash
pnpm build
```

### Start production server

```bash
pnpm start
```

### Environment Variables

Set the following in your production environment:
- `OPENAI_API_KEY` - Your OpenAI API key
- `OPENAI_MODEL` - Model to use (default: gpt-4-turbo-preview)

### Recommended Hosting

- **Vercel** - Best for Next.js (apps/web)
- **Railway** / **Render** - Good for the full stack
- **AWS** / **GCP** - For self-hosting

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           User (Browser)                     │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│      Next.js Web App (apps/web)              │
│  - Upload UI                                 │
│  - Tickets Board                             │
│  - Chat Editor                               │
└───────────────┬─────────────────────────────┘
                │ API calls
                ▼
┌─────────────────────────────────────────────┐
│      API Routes (/api/*)                     │
│  - /api/generate                             │
│  - /api/clarify                              │
│  - /api/edit                                 │
│  - /api/export                               │
└───────────────┬─────────────────────────────┘
                │ Import from agent
                ▼
┌─────────────────────────────────────────────┐
│      Agent (apps/agent)                      │
│  - LangGraph workflow                        │
│  - Tools (parse, extract, generate, etc.)    │
│  - OpenAI API calls                          │
└───────────────┬─────────────────────────────┘
                │ Persist to
                ▼
┌─────────────────────────────────────────────┐
│      Data Storage (data/)                    │
│  - JSON files for projects                   │
│  - Optional RAG embeddings                   │
└─────────────────────────────────────────────┘
```

## Next Steps

- Read the main [README.md](./README.md) for feature details
- Check out [EXAMPLE_INPUT.md](./EXAMPLE_INPUT.md) for sample requirements
- Start generating tickets!

## Need Help?

- Check the [README](./README.md) for detailed documentation
- Open an issue on GitHub
- Review the code comments in `apps/agent/src/` for implementation details

Happy ticket generation! 🚀

