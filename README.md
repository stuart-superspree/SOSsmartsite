# S.O.S. ConnectLoop

**ConnectLoop | Hire · Asset · Safety · Report · Access**
An NFC-triggered mobile web app for Storage on Site.
*Connecting people to what they need, where they need it.*

A ConnectLoop device is fixed to a hire unit. Tapping it with any smartphone
opens this app instantly — no app download, no login, no personal data collected.
The device also reports its position to SOS Fleet Control twice daily.

Built by **Superspree** · https://superspree.com

---

## What's in this repo

| File | Purpose |
|---|---|
| `index.html` | The entire app — HTML, CSS, JS, logo and icons in one self-contained file (~170KB) |
| `manifest.json` | Web app manifest — makes the app installable to the home screen |
| `sw.js` | Service worker — network-first shell, works offline on site |
| `icon-192.png`, `icon-512.png` | PWA install icons |
| `apple-touch-icon.png` | iOS home-screen icon |
| `favicon.png` | Browser tab icon |
| `robots.txt` | Blocks search indexing (this is a demonstration build) |
| `nixpacks.toml` | Tells Railway to install Caddy and serve statically |
| `railway.json` | Railway service configuration |
| `.gitignore` / `.gitattributes` | Repo hygiene |

No build step. No dependencies. No backend. Static files only.

---

## Step 1 — Publish to GitHub

```bash
# from inside this folder
git init
git add .
git commit -m "ConnectLoop v4 — S.O.S. demonstration build"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/sos-connectloop.git
git push -u origin main
```

If you'd rather not use the command line: create a new repository on GitHub,
choose **uploading an existing file**, and drag the entire contents of this
folder in. Make sure the files sit at the **root** of the repo, not inside a
subfolder — Caddy serves from `/app`, so `index.html` must be top-level.

> The `.gitignore` includes a leading dot, so it may be hidden in Finder or
> File Explorer. On Mac press `Cmd + Shift + .` to reveal hidden files before
> dragging.

---

## Step 2 — Deploy to Railway

1. Go to https://railway.app and sign in.
2. **New Project → Deploy from GitHub repo**.
3. Authorise Railway against your GitHub account if prompted, then pick
   `sos-connectloop`.
4. Railway reads `nixpacks.toml`, installs Caddy and starts automatically.
   No environment variables are needed.
5. Open the service → **Settings → Networking → Generate Domain**.
   You'll get something like `sos-connectloop-production.up.railway.app`.
6. Set the region to **Europe West (Amsterdam)** or **Europe West (Frankfurt)**
   under Settings → Region for best UK latency.

First deploy typically takes 60–90 seconds.

### Custom domain (optional)

Under **Settings → Networking → Custom Domain**, add e.g.
`connectloop.storageonsite.co.uk`, then add the CNAME record Railway gives you
to the SOS DNS. Railway issues the TLS certificate automatically.

---

## Step 3 — Write the NFC tags

Once the live URL is confirmed, encode it to the ConnectLoop devices as an
**NDEF URI record** using NFC Tools (iOS/Android) or a desktop encoder.

Recommended: give each unit its own URL parameter so a single build can serve
the whole fleet later — e.g. `https://your-domain/?unit=A-021`. The current
build ignores the parameter and always shows unit A-021, but encoding it now
means the tags won't need rewriting when per-unit data is wired in.

**Lock the tags read-only** after writing, or anyone with a phone can overwrite
them.

---

## Updating the app

Push to `main` and Railway redeploys automatically.

**Important:** bump `CACHE_VERSION` at the top of `sw.js` on every release
(`connectloop-v4` → `connectloop-v5`). The service worker is network-first for
HTML so returning visitors normally get the new build straight away, but
bumping the version guarantees old caches are cleared.

---

## Testing locally

Chrome blocks JavaScript and service workers on `file://` URLs, so serve over
HTTP:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

---

## Demonstration data

This is a **demonstration build**. The unit, hire, beacon, compliance and
document records shown are simulated, and this is stated in the app footer.
Verified against storageonsite.co.uk as of August 2026:

- Phone `023 8033 2266`, email `enquiries@storageonsite.co.uk`
- Southampton depot: North Road, Marchwood Industrial Estate, SO40 4BL
- Kent depot: Plot 8, Invicta Park, New Hythe Lane, Aylesford, ME20 7FG
- Depot booking in/out Mon–Fri 07:30–16:45 · Office Mon–Fri 07:30–18:00
- Brand palette `#00205C` navy, `#FFCB05` yellow, `#0042BF` blue
- Rating shown (4.9 from 354+) is the Google rating for the Southampton depot

Before any live deployment, confirm the review figure is still current and
agree with SOS how it should be attributed.

---

## Going live — what's still needed

The demo runs entirely client-side. A production deployment would need:

- A backend for real hire, asset and compliance records (per-unit lookup)
- Beacon telemetry ingest feeding the SOS Fleet Control map
- Form submissions routed to SOS (reports, inductions, extensions, enquiries)
- Induction sign-off storage for CDM record-keeping
- Document storage and access control for the Access module
