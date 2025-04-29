# Contributing to Convo

Thank you for your interest in contributing to Convo! This guide will help you get started with contributing to our codebase.

## 🌱 Project Overview

Convo is a Next.js application built by the Kernel Community that helps plant the kernel of conversations. It uses modern web technologies and follows a server-first approach with feature flags for gradual rollouts.

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: Dynamic Labs
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Feature Flags**: Vercel Flags
- **Real-time**: PartyKit
- **UI Components**: Radix UI
- **Type Safety**: TypeScript

## 🚀 Getting Started

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables (copy `.env.example` to `.env.local`)
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📦 Database Setup

We use Prisma with PgBouncer for connection pooling. Important configuration:

```env
DATABASE_DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true&connection_limit=1&pool_timeout=20&statement_cache_size=0"
DIRECT_URL="postgresql://user:pass@host:5432/db"
```

After making schema changes:
```bash
npm run data        # Format, generate, and push schema
npm run data-reset  # Reset database (caution!)
```

## 🎯 Development Guidelines

### Code Structure
- `/src/app` - Next.js app router pages and API routes
- `/src/components` - Reusable React components
- `/src/lib` - Core utilities and business logic
- `/src/context` - React context providers
- `/src/utils` - Helper functions and utilities

### Feature Flags
We use feature flags for gradual rollouts:
- Beta features are enabled for `@kernel.community` emails
- Flags are evaluated server-side
- Define new flags in `/src/lib/flags.ts`

### Authentication Flow
1. User authenticates with Dynamic Labs SDK
2. JWT token is verified server-side
3. Session cookie is set with user info
4. Feature flags use session data for targeting

### Type Safety
- Use TypeScript for all new code
- Define interfaces for component props
- Use Zod for API request/response validation

### Styling
- Use Tailwind CSS for styling
- Follow the existing class order convention
- Use the shadcn/ui component patterns

## 🧪 Code Quality

1. **Linting**:
   ```bash
   npm run lint
   ```

2. **Formatting**:
   ```bash
   npm run format      # Check formatting
   npm run format:fix  # Fix formatting
   ```

## 💬 Commit Convention

We use a structured commit message format to automatically generate our changelog. Each commit message should have a type, a description, and optionally a detailed body.

### Commit Types

- `feat:` - A new feature or significant enhancement
- `fix:` - A bug fix
- `improve:` - Improvements to existing features
- `beta:` - Experimental features or changes
- `chore:` - Changes to the build process or infrastructure

### Format

```
`type`(`scope`): `description`

`body`
```

### Examples

```bash
# Feature with details
feat(user-profile): Add user profile page

- Added profile information section
- Implemented avatar upload
- Added settings panel
- Connected to user API

# Simple fix
fix(user-profile): Correct button alignment on mobile

# Improvement with context
improve(search): Enhance search performance

- Added debouncing to search input
- Implemented result caching
- Optimized API queries

# Beta feature
beta(chat): Test new chat interface

- Experimental UI layout
- Real-time message preview
- New emoji picker
```

These commit messages will automatically appear in our [changelog](/changelog) page with appropriate categorization and formatting.

## 📝 Pull Request Process

1. Create a feature branch from `main`
2. Naming convention: `your-identifier/your-feature-name`
3. Make your changes following the guidelines
4. Ensure your commits follow the convention above
5. Run tests and formatting checks
6. Add as much information in your PR as possible with screenshots for both mobile and desktop
7. Create a PR against `main`
8. Wait for review and address feedback

### PR Checklist
- [ ] Screenshots included
- [ ] Feature flag added (if required)
- [ ] vercel checks pass (build successful)
- [ ] Commit messages are clear

## 🚥 Branch Strategy

- `main` - Production branch
- Feature branches from `main`

## 🔒 Security

- Never commit sensitive data or API keys
- Use environment variables for secrets
- JWT tokens are verified server-side
- Session cookies are HTTP-only

## 🤝 Code of Conduct

We follow the Kernel Community Code of Conduct. Please be respectful and constructive in all interactions.

## 🐛 Reporting Issues

- Use GitHub Issues for bug reports
- Include clear reproduction steps
- Mention relevant feature flags
- Add `beta` label if related to beta features

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Dynamic Labs Docs](https://docs.dynamic.xyz)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Kernel Community](https://kernel.community)
- [Convo Announcements](https://t.me/startaconvo)

## ❓ Questions?

Reach out on [X: @probablyangg](https://x.com/probablyangg) or [Telegram: @probablyangg](https://t.me/probablyangg)
