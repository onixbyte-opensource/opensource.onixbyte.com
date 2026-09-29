# OnixByte Homepage

The official OnixByte site — a central hub for technical blogs, project documentation, and development standards.

## Tech Stack

A static documentation site built with [Rspress](https://rspress.dev/), supporting bilingual content (`en-gb` / `zh-hans`). All pages are authored in Markdown / MDX.

## URLs

| Domain                                                     | Recommended For              |
|------------------------------------------------------------|------------------------------|
| [opensource.onixbyte.cn](https://opensource.onixbyte.cn)   | Users in China mainland      |
| [opensource.onixbyte.com](https://opensource.onixbyte.com) | Users outside China mainland |

## Local Development

```bash
pnpm install
pnpm dev        # Start dev server with HMR
pnpm build      # Production build, outputs to dist/
pnpm preview    # Preview the production build locally
pnpm lint       # ESLint
pnpm format     # Prettier — format all files
```

## Directory Structure

```
docs/
├── public/          # Static assets (logos, icons, etc.)
├── en-gb/           # English content
│   ├── blogs/       # Technical blog posts
│   ├── projects/    # Project documentation
│   └── notifications/  # Announcements
└── zh-hans/         # Simplified Chinese content
    ├── blogs/
    ├── projects/
    └── notifications/
```

## Deployment

Pushing to the `main` branch triggers a GitHub Actions workflow that builds the site and deploys it to GitHub Pages.

## Licence

MIT
