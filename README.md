# DeskSupport Hub – MVP demo

A clickable front-end MVP for **DeskSupport**: an IT service desk with **ticketing**, **user management** and a **CMS**, plus a client portal and a public website driven by the CMS.

There is no backend. All data is realistic sample data that lives in the browser (localStorage), so you can create tickets, invite users and publish pages during a demo and it all "sticks" until you reset it.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4 and shadcn/ui components (Radix UI), with Recharts for charts and Tiptap for the rich-text editor.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

For the smoothest demo, run the production build instead (faster page loads, no dev overlay):

```bash
npm run build && npm start
```

### Deploy a shareable link

Push the repo to GitHub and import it on [vercel.com](https://vercel.com/new). No environment variables are needed.

## Demo accounts

Use the one-click buttons on the login screen. You can also switch user at any time from the avatar menu → **Switch demo user**.

| User | Role | What they see |
| --- | --- | --- |
| Sarah Mitchell | Administrator | Everything: dashboard, tickets, clients, users & roles, CMS, settings |
| James Carter | Technician | Ticket queue, knowledge base, clients (permissions limit some actions) |
| Oliver Bennett | Client user (Harbour & Finch Solicitors) | Client portal: raise and track tickets, help articles, service alerts |

**Reset demo data** is in the avatar menu and under Settings → Demo data.

## What's in the MVP

**Ticketing (service desk)**
- Ticket queue with saved views (open, mine, unassigned, overdue/at risk, resolved), search and filters
- ClickUp-style **list view grouped by status** (or priority / assignee): collapsible sections with counts, a status circle on each row to change status in place, and drag-and-drop between groups
- Bulk assign / status / priority, plus a drag-and-drop **Kanban board**
- Ticket detail: conversation thread, **internal notes**, canned replies, "send and resolve", activity log
- Priorities and **SLA timers** (due / at risk / overdue; paused while waiting on the customer)
- Auto-assignment to the least-busy engineer, and a customer satisfaction rating
- Dashboard with KPIs, created-vs-resolved trend, top categories, SLA watchlist, team workload and client load

**User management**
- Staff and client contacts: invite, edit, suspend/reactivate, reset password, MFA status, delete
- Client companies with plans, seats, devices, MRR, account manager, contacts and ticket history
- **Roles & permissions** matrix (Administrator / Technician / Client) that takes effect immediately

**CMS**
- Website pages, help-centre articles and portal announcements
- Rich-text editor, draft / publish / unpublish, live preview, SEO title and description with a Google preview
- Published pages drive the public website at `/site`, and published announcements show as banners in the client portal

**Client portal**
- Branded home page with help-article search, open tickets, account manager and response times
- Raising a ticket suggests matching help articles first (ticket deflection)

**Extras:** ⌘K / Ctrl+K global search, notifications, dark mode, mobile layout, and live **brand colour** theming (Settings → Branding).

## Suggested 5-minute demo

1. **Login** → sign in as **Sarah** (Admin). Walk through the dashboard KPIs and the "Needs attention" SLA list.
2. **Tickets** → show the list grouped by status: collapse a group, click a row's status circle to move it, then switch to **Board** and drag a ticket to *Resolved*. Open *"Outlook keeps asking for my password…"* and show the thread, the internal note, a **canned reply** and the SLA panel.
3. **Users & roles** → invite a user, then open **Roles & permissions** and toggle a permission.
4. **Clients** → open *Harbour & Finch Solicitors* to show contacts, MRR and ticket history.
5. **Content (CMS)** → edit the *Home* page, click **Update live**, then **View website**. Publish an **announcement**.
6. **Switch demo user → Oliver** (client). The announcement shows as a banner. Raise a ticket: type "VPN" and matching help articles appear.
7. **Switch back to Sarah**. The new ticket is in the queue, auto-assigned, and shows up in notifications.
8. **Settings → Branding** → pick a colour to re-theme the whole app live.

## Editing the website

Pages are written as normal rich text in **Content (CMS)**, and the public site at `/site` lays them out automatically:

| Write this in the editor | It becomes |
| --- | --- |
| The first Heading 1 and the paragraph after it | The page hero (on Home: the big centred headline between the illustrations) |
| A heading (H2) | A new section, with the heading on the left and its content on the right |
| A bullet list where every item starts in **bold** (e.g. "**Fast response** – picked up within 30 minutes") | On Home: the bullet list in the dark "Why us" section. On other pages: numbered steps |
| Any other bullet list | A chevron bullet list (two columns when it has more than three items) |
| A quote | A testimonial (put the author after a dash: "Great team." – Office Manager, Bristol) |
| On About, a heading containing "team" or "people" | That section also shows the staff portraits from **Users & roles** |

Pages with *Show in navigation* switched on appear in the menu; About, Contact and Pricing sit in the main bar and everything else goes under **Services**. Live figures come from the app: the "30 min" sticker uses the urgent SLA in Settings, the satisfaction seal uses rated tickets, and the team, account manager and "Or call us directly" contact come from active staff.

The laptop mockups on the home page are real screenshots of the Hub in `public/site/` (`portal-home.webp` and `hub-tickets.webp`). Retake them if the app's look changes. The illustrations are drawn in code in `src/components/site/illustrations.tsx`, so they need no image files and can be recoloured there.

## Rebranding

- Name, tagline, phone, email and colour: **Settings → Branding** in the app (stored per browser).
- Defaults for a fresh browser: `DEFAULT_SETTINGS` in `src/lib/seed.ts`, and `--brand` in `src/app/globals.css`.
- The logo mark is in `src/components/logo.tsx`. Swap in the client's SVG logo there.

## Project structure

```
src/
  app/
    login/                 sign-in with demo accounts
    (app)/                 authenticated app (shared sidebar shell)
      dashboard/           KPIs and charts
      tickets/             queue, board and ticket detail
      users/               users, invites and roles & permissions
      companies/           client companies
      cms/                 content list and editor
      knowledge-base/      help centre
      portal/              client home
      settings/            branding, SLAs, categories, portal options
    site/                  public website rendered from CMS pages
  components/              app shell, dialogs, charts, editor; ui/ = shadcn components
  lib/
    seed.ts                sample data (clients, users, tickets, content)
    store.ts               Zustand store (stands in for the backend API)
    types.ts, constants.ts, format.ts, cms.ts
```

## From MVP to production

The store in `src/lib/store.ts` is the seam to replace with real API calls. Typical next steps:

- Auth (e.g. Microsoft Entra ID / Google SSO, MFA) and a database (Postgres)
- Email-to-ticket and ticket notifications (Microsoft 365 / SendGrid)
- File attachments, ticket merge, time tracking and billing exports
- RMM/PSA integrations (NinjaOne, Datto, ConnectWise), asset inventory
- Business-hours SLA calendars, escalations and reporting exports
- Audit log and GDPR tooling
