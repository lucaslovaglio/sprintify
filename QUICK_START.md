# 🚀 Quick Start

Get Sprintify running in 5 minutes!

## 1. Prerequisites

```bash
# Check Node.js version (need 18+)
node --version

# Install pnpm if you don't have it
npm install -g pnpm
```

## 2. Install

```bash
pnpm install
```

## 3. Configure

Create your OpenAI API key at https://platform.openai.com/api-keys

```bash
# Set up environment for web app
echo 'OPENAI_API_KEY=sk-your-key-here' > apps/web/.env.local

# Set up environment for agent
echo 'OPENAI_API_KEY=sk-your-key-here' > apps/agent/.env.local
```

**Replace `sk-your-key-here` with your actual API key!**

## 4. Build Agent

```bash
cd apps/agent
pnpm build
cd ../..
```

## 5. Run

```bash
pnpm dev
```

Open http://localhost:3000 🎉

## 6. Test

Copy the example from `EXAMPLE_INPUT.md`, paste it in the web app, and click "Generate Tickets"!

---

**Need more details?** Check out [SETUP.md](./SETUP.md) for the complete setup guide.

