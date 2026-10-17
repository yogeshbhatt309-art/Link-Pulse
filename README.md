# LinkNova — URL Shortener Landing Website

A responsive, dark-themed URL shortener website inspired by modern link-management landing pages. It uses its own name, copy, layout details, and styling rather than copying proprietary branding/assets.

## Included
- Responsive landing page
- URL input and short-link result UI
- Copy link button
- Optional QR code preview
- Feature, solution, pricing, and CTA sections
- Mobile navigation
- No build step required

## Run locally
Open `index.html` in a browser, or use VS Code Live Server.

## Deploy on GitHub + Vercel
1. Extract this ZIP.
2. Create a new GitHub repository.
3. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository root.
4. In Vercel, choose **Add New → Project**, import the repository, and deploy.
5. Framework preset: **Other**. Build command: leave blank. Output directory: `.` (or leave default if Vercel detects static files).

## Important limitation
The current demo calls the public `is.gd` shortening endpoint from the browser. Public APIs can change, rate-limit, or block browser requests, so this is not a guaranteed production backend. QR images are generated through QR Server. For a production service with custom slugs, saved links, user accounts, password protection, expiry, click analytics, and reliable redirects, add a server-side API and persistent database (for example, Supabase or another database). Do not put private API keys in browser JavaScript.

## Branding
Replace “LinkNova” in `index.html` with your own brand name before launch.
