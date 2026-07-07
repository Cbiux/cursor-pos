<p align="center">
  <img src="public/CUBE_2D_LIGHT.svg" alt="Cursor logo" width="140" />
</p>

<h1 align="center">Cursor POS</h1>

<p align="center">
  Browser-based thermal ticket printing for Cursor events.<br />
  Event tickets, photo wall, Luma badges, Cursor Credits, and live preview. No desktop app required.
</p>

<p align="center">
  <a href="https://cursor-pos.vercel.app"><strong>Live app</strong></a>
  ·
  <a href="https://cursor-pos.vercel.app/docs"><strong>Documentation</strong></a>
  ·
  <a href="https://github.com/cursorcommunityled/cursor-pos"><strong>GitHub</strong></a>
</p>

---

## What is Cursor POS?

**Cursor POS** is a web app to print **58 mm thermal tickets** directly from **Chrome or Edge** using **Web Serial**. Built for meetups, check-in desks, credit handouts, and event photo walls.

Printing runs **in the browser on each machine**. The Vercel deployment serves the UI; your printer connects locally via Bluetooth Serial.

## Ticket modes

| Mode | Use case |
| --- | --- |
| **Event ticket** | Custom receipts with QR, WiFi, name, and toggleable sections |
| **Photo ticket** | Camera capture or upload for a post-event photo wall |
| **Luma check-in** | Scan guest QRs, confirm, and print badges |
| **Cursor Credits** | Print claim-link tickets from a CSV queue |

## Features

### Event ticket
- Cursor logo, custom QR, business name, event type, action label
- Attendee name and optional extra line
- WiFi network and password block
- **Section toggles** — show/hide logo, QR, event type, action, name, extra, WiFi, timestamp
- Live preview updates as you edit
- Save default field values in the browser

### Photo ticket
- Capture from camera or upload an image
- 3, 2, 1 countdown before capture
- Review, retake, drag-to-frame, and confirm before printing
- Switch between front/back cameras when available
- Name, extra line, timestamp, and Cursor logo on the ticket

### Luma check-in
- Scan guest QR codes from the device camera
- **Confirm before print** — beep on scan, review guest, then print or discard
- Load guest details from Luma via API (server proxy or browser key)
- **Configurable badge QR** — use Event ticket QR content or the guest's Luma check-in URL
- Toggle logo, QR, action, ticket type, and timestamp on the badge
- Live session log with reprint
- **Does not mark check-in in Luma** — the public API no longer supports it; use Luma's official scanner for attendance

### Cursor Credits
- Upload a **CSV** with claim links (`name`, `url` columns suggested)
- Each row = one ticket; the **QR is the claim URL**
- **Print next** advances the queue automatically
- Reset or clear the queue; progress persists in localStorage
- Sample file: [`examples/cursor-credits-test.csv`](examples/cursor-credits-test.csv)

### General
- Four ticket modes with large live preview (58 mm and 80 mm paper)
- Direct print over Web Serial (ESC/POS)
- Download raw ESC/POS file as backup
- English and Spanish UI, light/dark theme
- Full setup guide at [/docs](https://cursor-pos.vercel.app/docs)

## Recommended printer

Tested with **GOOJPRT PT-210** (portable, Bluetooth, 58 mm thermal paper).

| Spec | Detail |
| --- | --- |
| Model | GOOJPRT PT-210 |
| Paper | 58 mm thermal |
| Connection | Bluetooth (virtual COM / Serial) |
| Protocol | ESC/POS |
| Recommended baud | **9600** |

It should also work with other **58 mm Bluetooth thermal printers** that expose a **Serial (COM) port** and support ESC/POS.

## Quick start (printing)

1. Pair the printer via **Bluetooth** in your OS settings.
2. Open [cursor-pos.vercel.app](https://cursor-pos.vercel.app) in **Chrome** or **Edge** (HTTPS required).
3. Click **Connect Serial** and select the paired printer port.
4. Set baud rate to **9600**.
5. Pick a ticket mode, fill in fields, and print.

See the full guide: [cursor-pos.vercel.app/docs](https://cursor-pos.vercel.app/docs)

## Cursor Credits CSV format

```csv
name,url
Ana Garcia,https://cursor.com/redeem/example-001
Carlos Mora,https://cursor.com/redeem/example-002
```

The parser also accepts columns named `link`, `claim`, `label`, `email`, or `guest`, and `;` as separator.

## Requirements

- **Browser:** Chrome or Edge (Web Serial)
- **HTTPS** or `localhost` (required for camera and printer APIs)
- **Printer:** 58 mm thermal (80 mm optional in settings)
- **Windows:** use Serial over Bluetooth; WebUSB is blocked by drivers on most setups

## Development

```bash
git clone https://github.com/cursorcommunityled/cursor-pos.git
cd cursor-pos
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

### Luma integration

There are two ways to use **Luma check-in**:

#### Option A — Connect your calendar in the browser (quick)

1. Open the **Luma check-in** tab
2. Paste your calendar API key from [luma.com/calendar/manage/api-keys](https://luma.com/calendar/manage/api-keys)
3. The key is stored in **sessionStorage** only (this tab). It is **not** saved on the Vercel server
4. Each API call sends the key in a request header; the server forwards it to Luma and does not persist it

**Security note:** on a shared deployment, your key still transits through that server on each request. For maximum security, use Option B.

#### Option B — Fork and deploy your own instance (recommended)

1. Fork [github.com/cursorcommunityled/cursor-pos](https://github.com/cursorcommunityled/cursor-pos)
2. Deploy to your Vercel account
3. Set `LUMA_API_KEY` in **Project Settings → Environment Variables**
4. Use your own URL. The key stays on your server only; staff never paste keys in the browser

Requires **Luma Plus**. Event ticket, photo, and Cursor Credits work without any Luma configuration.

> **Note:** Port `3000` is often used by other local apps. This project uses **3001** by default.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

### Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [@point-of-sale/receipt-printer-encoder](https://www.npmjs.com/package/@point-of-sale/receipt-printer-encoder) for ESC/POS
- [Web Serial](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) for browser printing
- [Tailwind CSS 4](https://tailwindcss.com)
- Deployed on [Vercel](https://vercel.com)

## Project structure

```
src/
  app/              Next.js routes (/, /docs, API)
  components/       UI (PosApp, LumaCheckin, CursorCredits, previews)
  hooks/            Browser printer hook
  lib/              Receipt builders, Luma client, credits CSV, i18n
examples/
  cursor-credits-test.csv   Sample CSV for Cursor Credits mode
public/
  CUBE_2D_LIGHT.svg         Official Cursor logo asset
```

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cursorcommunityled/cursor-pos)

Or connect your fork to Vercel. No server-side printer access is needed for the main workflow.

## Feedback

Found a bug or have an idea? Open an [issue](https://github.com/cursorcommunityled/cursor-pos/issues) or try the app at your next event and share feedback.

## Author

Built by **[cbiux](https://linktr.ee/cbiux)** for Cursor community events.

Pura Vida
