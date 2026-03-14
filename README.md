# v0-e-hailing-service---Panda-Rider

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_1vpvBqWn9WTf4hDczrJssvYpF37H)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Firebase integration (Fire StudioBase)

To merge with Firebase from your project (e.g. `studio.firebase.google.com/panda-ridergit-93207626`):

1. Create a Firebase service account JSON and set env vars in `.env.local`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (replace newlines with `\n`)

2. Use Firestore in API routes: `app/api/tracking/route.ts` already writes `drivers` to Firestore if configured.

3. Start dev server:
   ```bash
   npm run dev
   ```

You can still run without Firebase; demo drivers are used as fallback.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/djauxide/v0-e-hailing-service---Panda-Rider" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
