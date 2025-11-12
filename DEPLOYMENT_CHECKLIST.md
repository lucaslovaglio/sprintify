# 🚀 Deployment Checklist

Use this checklist before deploying Sprintify to production.

## Pre-Deployment

### 1. Environment Setup
- [ ] OpenAI API key configured in production environment
- [ ] API key has sufficient credits/quota
- [ ] Model selection appropriate for production load
- [ ] Environment variables secured (not committed to git)

### 2. Security Review
- [ ] Rate limiting configured (recommended: 10 requests/minute per IP)
- [ ] File upload size limits enforced (5MB)
- [ ] PII filtering enabled and tested
- [ ] Prompt injection defenses active
- [ ] CORS configured appropriately
- [ ] API routes protected with proper authentication (if needed)

### 3. Testing
- [ ] Upload test document (PDF)
- [ ] Upload test text
- [ ] Test clarification flow
- [ ] Test ticket editing via chat
- [ ] Test all export formats (JSON, CSV, MD)
- [ ] Verify cost tracking accuracy
- [ ] Test error handling (bad input, API failures)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness check

### 4. Performance
- [ ] Agent build optimized (`pnpm build`)
- [ ] Next.js production build successful
- [ ] Static assets optimized
- [ ] Consider CDN for static files
- [ ] Monitor API response times (target: <30s for generation)

### 5. Monitoring
- [ ] Error tracking configured (Sentry, LogRocket, etc.)
- [ ] Cost monitoring dashboard
- [ ] API usage metrics
- [ ] Performance monitoring
- [ ] Uptime monitoring

### 6. Documentation
- [ ] API documentation complete
- [ ] User guide published
- [ ] FAQ created
- [ ] Support channels established

## Deployment Options

### Option 1: Vercel (Recommended)

**Pros**: Zero-config Next.js deployment, great DX  
**Cons**: Serverless function timeout limits

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel
```

**Environment Variables in Vercel:**
- Add `OPENAI_API_KEY` in project settings
- Add `OPENAI_MODEL` if using non-default

**Important**: Increase serverless function timeout:
- Go to Project Settings → Functions
- Set max duration to 60 seconds

### Option 2: Railway

**Pros**: Full-stack deployment, no timeout limits  
**Cons**: Requires more configuration

1. Create new project on Railway
2. Connect GitHub repo
3. Set root directory to `apps/web`
4. Add environment variables
5. Deploy

### Option 3: AWS (EC2 + RDS)

**Pros**: Full control, scalable  
**Cons**: More complex setup

1. Set up EC2 instance (t3.medium or larger)
2. Install Node.js 18+, pnpm
3. Clone repo, install dependencies
4. Build: `pnpm build`
5. Use PM2 for process management:
   ```bash
   npm i -g pm2
   pm2 start apps/web/node_modules/.bin/next -- start
   pm2 save
   pm2 startup
   ```
6. Configure nginx as reverse proxy
7. Set up SSL with Let's Encrypt

### Option 4: Docker

```dockerfile
# Dockerfile (root)
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps ./apps

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build agent
RUN cd apps/agent && pnpm build

# Build web
RUN cd apps/web && pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

Build and run:
```bash
docker build -t sprintify .
docker run -p 3000:3000 -e OPENAI_API_KEY=sk-... sprintify
```

## Post-Deployment

### 1. Smoke Tests
- [ ] Generate tickets from sample document
- [ ] Verify tickets display correctly
- [ ] Test export functionality
- [ ] Check cost tracking

### 2. Monitoring Setup
- [ ] Set up alerts for errors
- [ ] Monitor OpenAI API costs
- [ ] Track user engagement
- [ ] Set up uptime checks

### 3. Optimization
- [ ] Review LLM costs after first week
- [ ] Optimize prompts if needed
- [ ] Consider caching for common queries
- [ ] Add rate limiting if needed

## Production Environment Variables

```env
# Required
OPENAI_API_KEY=sk-prod-key-here

# Optional but recommended
OPENAI_MODEL=gpt-4-turbo-preview
NODE_ENV=production

# For enhanced monitoring (optional)
SENTRY_DSN=https://...
ANALYTICS_ID=...
```

## Scaling Considerations

### Small Scale (< 100 users)
- Current file-based storage is fine
- Single instance deployment
- Basic monitoring

### Medium Scale (100-1000 users)
- Migrate to Supabase for storage
- Add Redis for caching
- Load balancer for multiple instances
- Enhanced error tracking

### Large Scale (1000+ users)
- Database cluster (PostgreSQL)
- Redis cluster for caching
- CDN for static assets
- Multiple app instances
- Advanced monitoring & alerting
- Cost optimization strategies

## Security Hardening

### Rate Limiting
Add middleware in Next.js:
```typescript
// middleware.ts
import { rateLimit } from '../../lib/rate-limit';

export async function middleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await rateLimit.check(ip);
  
  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }
}
```

### Authentication (Optional)
For multi-user deployments, add:
- NextAuth.js for authentication
- User project isolation
- Usage quotas per user

### API Key Protection
- Rotate keys regularly
- Use separate keys for dev/staging/prod
- Monitor for unusual usage patterns

## Cost Management

### Budget Alerts
- Set up OpenAI usage alerts
- Monitor cost per project
- Consider implementing usage caps

### Cost Optimization
- Use `gpt-3.5-turbo` for non-critical operations
- Cache common queries
- Implement smart prompt engineering
- Consider batch processing

## Rollback Plan

If issues occur:

1. **Immediate**: Revert to previous deployment
   ```bash
   vercel rollback
   ```

2. **Disable problematic features**: Comment out in code

3. **Restore data**: Keep backups of `data/projects/`

4. **Monitor**: Check error rates, user reports

## Support Checklist

- [ ] Support email/channel set up
- [ ] FAQ page published
- [ ] Known issues documented
- [ ] Escalation process defined

## Legal & Compliance

- [ ] Privacy policy published
- [ ] Terms of service defined
- [ ] Data retention policy documented
- [ ] GDPR compliance (if EU users)
- [ ] OpenAI terms of service reviewed

---

**Ready for Production?**

✅ All items checked? You're ready to deploy!  
⚠️ Missing items? Address them before going live.  
❓ Questions? Review the docs or open an issue.

**Good luck with your deployment! 🚀**

