# 🚀 Sprintify

**Agente de Generación Automática de Tickets de Desarrollo**

Sprintify analyzes project requirements documents (text or PDF) and automatically generates structured development tickets with titles, descriptions, acceptance criteria, effort estimation (story points), priority, and use cases. Edit tickets via natural language chat.

## ✨ Features

- 📄 **Document Parsing** - Upload PDF or paste text requirements
- 🤖 **AI-Powered Analysis** - Extract structured requirements using LLM
- ❓ **Smart Clarifications** - Ask targeted questions when key info is missing
- 🎫 **Ticket Generation** - Create detailed tickets with acceptance criteria
- ✏️ **Chat Editing** - Modify tickets using natural language ("split ticket 3", "add criteria to 5")
- 📊 **Validation** - Check for consistency, dependencies, and coverage
- 💾 **Export** - Download as JSON, CSV, or Markdown
- 💰 **Cost Tracking** - Real-time token usage and cost estimation
- 🔒 **Security** - PII filtering, prompt injection defense, scope validation

## 🏗️ Architecture

Monorepo structure with pnpm:
- **apps/web** - Next.js 15 frontend (App Router) with Vercel AI SDK
- **apps/agent** - LangGraph agent (TypeScript) with tools
- **data/** - File-based JSON storage for projects

## 📋 Requirements

- Node.js 18+ 
- pnpm 8+
- OpenAI API key

## 🚀 Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Create `.env.local` in both `apps/web` and `apps/agent`:

**apps/web/.env.local:**
```env
# OpenAI API Key (required)
OPENAI_API_KEY=sk-...

# Model selection (optional, defaults to gpt-4-turbo-preview)
OPENAI_MODEL=gpt-4-turbo-preview
```

**apps/agent/.env.local:**
```env
# OpenAI API Key (required)
OPENAI_API_KEY=sk-...

# Model selection (optional)
OPENAI_MODEL=gpt-4-turbo-preview
```

### 3. Run the application

```bash
# Start both web and agent in development mode
pnpm dev

# Or run individually
cd apps/web && pnpm dev
cd apps/agent && pnpm dev
```

The web app will be available at http://localhost:3000

## 📖 Usage

### 1. Upload Requirements

- **Upload a PDF** - Drag and drop or click to browse
- **Paste text** - Copy/paste your requirements directly

Example input:
```
We need a web platform for course enrollment.

Goals: 
- Students can browse courses and enroll
- Students can pay for courses
- Admins can manage the course catalog

Constraints:
- Budget: less than $150/month
- Prefer AWS hosting
- Release in 6 weeks

Features:
- User authentication
- Course catalog with search
- Shopping cart and checkout (Stripe)
- Admin CRUD for courses
- Reports dashboard

Stakeholders: students, admins, finance team
```

### 2. Answer Clarifications (if needed)

The system may ask up to 3 targeted questions to improve accuracy:
- Budget details
- Timeline/deadlines
- Expected user scale
- Team composition

### 3. Review & Edit Tickets

Generated tickets include:
- **ID** - Unique identifier (e.g., TICKET-001)
- **Title** - Action-oriented (e.g., "Implement user authentication")
- **Description** - What and why
- **Acceptance Criteria** - Testable requirements (Given/When/Then)
- **Effort Points** - Fibonacci scale (1, 2, 3, 5, 8, 13)
- **Priority** - P1 (critical), P2 (important), P3 (nice-to-have)
- **Labels** - Tags (e.g., "frontend", "authentication")
- **Dependencies** - Ticket IDs that must be completed first

### 4. Edit via Chat

Natural language commands:
- "Split ticket 3 into frontend and backend tasks"
- "Add acceptance criteria to ticket 5"
- "Increase detail on ticket 2"
- "Merge tickets 4 and 6"
- "Change priority of ticket 7 to P1"

### 5. Export

Download your backlog:
- **JSON** - Full project state with metadata
- **CSV** - Spreadsheet-compatible format
- **Markdown** - Human-readable documentation

## 🏛️ System Architecture

### LangGraph Workflow

```
Parse Document → Security Checks → Extract Requirements
     ↓
Clarify Missing Data → RAG Search (optional)
     ↓
Generate Tickets → Validate Tickets → Persist Project
```

### Agent Tools

1. **parseDocument** - Extract text from PDF or plain text
2. **extractRequirements** - LLM-based structured extraction
3. **clarifyMissing** - Identify missing critical information
4. **generateTickets** - Create tickets from requirements
5. **validateTickets** - Check consistency and coverage
6. **persistProject** - Save to JSON
7. **costTracker** - Track token usage and costs
8. **security** - PII filtering and scope validation
9. **ragSearch** - Find similar past projects (optional)

## 🧪 Example Output

For the course enrollment example above, Sprintify generates ~8-12 tickets:
- TICKET-001: Set up authentication system (5 pts, P1)
- TICKET-002: Implement course catalog API (5 pts, P1)
- TICKET-003: Build course search functionality (3 pts, P2)
- TICKET-004: Create shopping cart (5 pts, P1)
- TICKET-005: Integrate Stripe payment (8 pts, P1)
- TICKET-006: Build admin dashboard (8 pts, P2)
- TICKET-007: Add reports functionality (5 pts, P3)
- ...

## 🔒 Security Features

- **PII Detection** - Blocks emails, SSNs, credit cards, API keys
- **Prompt Injection Defense** - Sanitizes "ignore previous instructions" patterns
- **Scope Control** - Rejects non-technical documents
- **File Size Limits** - Max 5MB uploads
- **Type Validation** - PDF and text only

## 📊 Cost Management

Real-time tracking:
- Tokens in (prompt)
- Tokens out (completion)
- USD cost estimate

Typical costs per run:
- Small project (1-2 pages): $0.10 - $0.30
- Medium project (3-5 pages): $0.30 - $0.80
- Large project (10+ pages): $0.80 - $2.00

## 🛠️ Development

### Project Structure

```
apps/
  web/
    app/
      api/              # Next.js API routes
      components/       # React components
      lib/              # Schemas and utilities
  agent/
    src/
      tools/            # Agent tools
      prompts/          # System prompts
      graph.ts          # LangGraph workflow
      index.ts          # Main entry point
data/
  projects/             # Persisted project states
  embeddings/           # RAG embeddings (optional)
```

### Build for Production

```bash
# Build all packages
pnpm build

# Start production server
pnpm start
```

### Testing

```bash
# Run tests (when implemented)
pnpm test
```

## 🎯 Roadmap

- [ ] Unit tests for all tools
- [ ] Integration tests
- [ ] Enhanced RAG with vector embeddings
- [ ] Supabase backend (instead of file-based)
- [ ] Real-time streaming UI updates
- [ ] Multi-user support
- [ ] JIRA/Linear integration
- [ ] Custom prompts per project type

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 💬 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ using Next.js, LangGraph, and OpenAI**
