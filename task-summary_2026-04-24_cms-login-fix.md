# Caelis Galeria - CMS Login Fix (2026-04-24 14:37)

## Objective
Fix Decap CMS login issue on Netlify deployment — user could not set password or accept invitation.

## Root Cause
Netlify Identity sends invite/reset links as `https://site.com/#invite_token=xxx` (hash-based). The site's homepage (`index.html`) did NOT load the Netlify Identity widget, so the token in the URL hash was never processed — the page just showed the normal gallery homepage.

## Solution
Added `netlify-identity-widget.js` script to `base.njk` template (the base layout used by ALL pages including the homepage). The widget automatically:
1. Detects `#invite_token=xxx`, `#recovery_token=xxx`, `#confirmation_token=xxx` in URL hash
2. Shows a modal for password setup / confirmation
3. After successful auth, redirects to `/admin`

## Key Changes
- **File: `src/_includes/base.njk`** — Added Identity widget `<script>` + init code before `</body>`
- **File: `netlify.toml`** — Removed catch-all `/* → /index.html` redirect that was intercepting Identity routes
- **File: `.gitignore`** — Added to prevent `_site/` from being committed
- **File: `public/invite.html`** — Created (backup approach, not needed after base.njk fix)

## Previous Failed Attempts (for reference)
1. `_redirects` file with catch-all rule → intercepted all routes including `/.netlify/*`
2. `netlify.toml` redirect exclusions → Netlify redirects can't exclude paths from `/*`
3. Standalone `/invite` page with manual `acceptInvite()` call → API requires password param
4. Deleting and re-inviting user → same root cause (homepage lacks widget)
5. Password reset email → same issue (hash token not processed on homepage)

## Result
✅ CMS fully operational at https://funny-ganache-bd9e99.netlify.app/admin/
✅ User can log in, view/edit Exhibitions, Articles, Site Settings
✅ Editorial workflow configured

## Pending
- Bind custom domain `caelis.cn` (DNS config at 美橙)
