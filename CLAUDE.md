# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single Vercel serverless function that gates the download of an APK hosted on
Google Drive. There is no build step, no test suite, and no framework — the
entire project is `api/dl.js` plus a minimal ESM `package.json`.

- `api/dl.js` — default-export request handler (Vercel Node function). On an
  authorized request it streams the Drive file back as
  `application/vnd.android.package-archive` (`app.apk`); otherwise it returns a
  small HTML page with a password form.

## Commands

No `dev`/`build`/`test` scripts are defined. Iterate with the Vercel CLI:

```bash
vercel dev     # run the function locally at /api/dl
vercel         # deploy a preview
vercel --prod  # deploy to production
```

## Authorization model (important)

`api/dl.js` authorizes a request one of two ways:

1. Client IP (`x-forwarded-for` first hop) **and** exact User-Agent both match
   hardcoded target values, or
2. `POST` with a body `key` equal to a hardcoded access key (the HTML form path).

These constants — the target IP, the target UA, the Drive file ID, and the access
key — are **committed literals in `api/dl.js`**. Treat them as low-value gating,
not real security: the key ships in the source and IP/UA are trivially spoofable.
If you touch this file, prefer moving these values into environment variables
(`process.env`) rather than duplicating them elsewhere, and do not copy the
literal key/IP into other files (including this one).
