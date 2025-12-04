# TurqHESL Monorepo

This is a monorepo project containing multiple Next.js applications using npm workspaces.

## Project Structure

```
turqhesl/
├── apps/
│   ├── admin/          # Admin panel application (port 3000)
│   └── customer/       # Customer-facing application (port 3001)
├── packages/
│   ├── ui/            # Shared UI components
│   └── utils/         # Shared utilities
└── package.json       # Root workspace configuration
```

## Getting Started

First, install dependencies:

```bash
npm install
```

### Run both applications in development mode:

```bash
npm run dev
```

### Run specific applications:

```bash
# Admin panel only (http://localhost:3000)
npm run dev:admin

# Customer app only (http://localhost:3001)
npm run dev:customer
```

### Build applications:

```bash
# Build all apps
npm run build

# Build specific apps
npm run build:admin
npm run build:customer
```

### Start production servers:

```bash
npm run start:admin
npm run start:customer
```

You can edit pages in `apps/admin/app/page.tsx` or `apps/customer/app/page.tsx`. The pages auto-update as you edit the files.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
