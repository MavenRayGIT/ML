# Welcome to Your Website — Sustained Outcomes
> Your complete guide to how your site works, how to manage it,
> and your relationship with Mack & Lee going forward.
> Read this once. Keep it handy.

---

## Welcome

Your website is live. This document explains everything you need to know
about how it works, how to make changes, how Mack & Lee stays involved,
and what your options are as your needs evolve.

Your site was built differently than most. There's no login, no page
builder, no CMS to learn. Instead, you manage your content through
a conversation with an AI assistant — the same way you'd send a message
to a colleague. This document explains exactly how that works and what
happens behind the scenes.

---

## How Your Site Is Built

Your site is a modern static website built on open standards:

- **Plain files** — your content lives as simple text files in a code
  repository. No database, no server software to maintain or update.
- **GitHub** — a version-controlled repository stores every version of
  your site. Every change is tracked, reversible, and auditable.
- **Cloudflare Pages** — your site is hosted on green, renewable-energy
  infrastructure. When you or your AI makes a change, it deploys
  globally in under 60 seconds.
- **Claude AI** — your primary interface for content management.
  You describe what you want. Claude makes it happen.

This approach means your site is fast, secure, low-cost to run,
and fully portable. You are never locked into Mack & Lee or any
specific tool. Everything is documented and transferable.

---

## Your Day-to-Day: Managing Content with AI

For routine content — blog posts, copy updates, landing pages —
you work directly with Claude. No developer required.

**How it works:**

1. Open your Claude project (claude.ai → Sustained Outcomes project)
2. Describe what you want in plain English
3. Claude makes the change and sends you a preview link
4. You review it — looks good? Claude publishes it live
5. Change is live on your site within 60 seconds

**What you can manage this way:**
- Blog posts (text, images, video embeds)
- Landing pages for programs or events
- Copy updates on existing pages
- Button text, headlines, section copy
- Adding partners, updating bios

**Your reference guide for this:** `CLIENT_ADMIN.md`
It has exact examples of what to say to Claude for every common request.

---

## When Changes Affect Code

Some requests go beyond content. If what you're asking for
requires a structural change — a new section type, a layout
modification, a new feature — Claude will tell you clearly:

> *"This change affects the site's code and structure.
> I can't make this directly. Would you like me to open
> a Change Request for Mack & Lee to review?"*

You say yes or no.

---

## The Change Request Process

When a code-level change is needed, here's what happens:

### Step 1 — Claude does the work first
Claude doesn't just file a ticket and wait. It:
- Analyzes what you're asking for
- Checks whether it fits existing components or needs something new
- Drafts a specification for the change
- Estimates complexity (minor / moderate / significant)
- Flags any design decisions that need M&L input
- Prepares as much of the implementation as it can

### Step 2 — Change Request is created
Claude creates a Change Request that includes:
- What you asked for (in your words)
- What it requires technically
- What Claude has already prepared
- Complexity level
- Recommended action: implement now / bundle in next sprint

### Step 3 — M&L reviews
Mack & Lee receives the Change Request. They review:
- Does this make sense for the site?
- Does it align with the design system?
- Is Claude's approach correct?
- Does it need to be done now or bundled?

M&L's role here is quality control, not labor.
The AI does the work. M&L makes sure it doesn't go off the rails.

### Step 4 — You get notified
You receive an email:
- What was requested
- What M&L decided (approve / modify / defer)
- If approved: a staging preview link to review
- If deferred: added to the next sprint, with estimated timeline

### Step 5 — You review and approve
Review the staging site. It looks and works exactly like your
live site — just a private preview URL.

You can:
- Approve it: Claude publishes to production
- Request changes: describe what's off, Claude adjusts
- Escalate to M&L: flag it for M&L to look at before publishing

### Step 6 — Live
Once approved, the change deploys to your live site automatically.
You receive a confirmation email with the live URL.

---

## Sprint Bundling

Not every Change Request needs immediate attention.
Minor enhancements, new features, or nice-to-haves get
bundled into a sprint — a scheduled batch of work.

**Why this matters for you:**
- Prevents constant small interruptions
- Keeps changes organized and reviewable together
- Lets M&L plan and price efficiently
- Gives you a clear picture of what's coming

**How it works:**
When Claude creates a Change Request, it recommends:
- **Implement now** — simple, isolated, no design risk
- **Bundle in next sprint** — involves layout, design, or multiple components

M&L reviews that recommendation and confirms.
Sprint schedule is agreed with you in advance.
You can always request urgent handling — M&L will advise on timing.

---

## Staying Informed — How You See Status

You don't need to log into anything to stay informed.

**Email notifications for:**
- Change Request created (with summary)
- M&L review decision
- Staging build ready for your review
- Change approved and live
- Monthly site performance summary (1st of each month)

**In Claude:**
You can always ask:
> *"What's the status of my pending change requests?"*
> *"What changed on my site this month?"*
> *"Show me what's in the next sprint."*

Claude has full context of your site history and
can answer questions about any change at any time.

**Staging previews:**
Every change gets a private preview URL before going live.
You can share it with anyone — no login required to view.
It looks and works exactly like your live site.

---

## M&L's Ongoing Role

Mack & Lee is not your day-to-day content manager.
Claude handles that. M&L's ongoing role is:

| What M&L does | Frequency |
|---------------|-----------|
| Review and approve Change Requests | As needed |
| Sprint planning and execution | Monthly or as agreed |
| Analytics review and recommendations | Quarterly |
| Stack maintenance and upgrades | As needed |
| Quality control on AI-generated changes | Every Change Request |
| Strategic site recommendations | Annually or on request |

**What you're paying for:**
Not hours. Not tickets. You're paying for a professional
set of eyes at the moment it matters — before something
goes live that shouldn't. The AI does the work.
M&L makes sure it's right.

---

## Your Monthly Report

On the 1st of every month, you'll receive an email summary:

- How many people visited your site
- Which pages and posts were most read
- How many people clicked "Request a Meeting"
- What's working
- What to focus on next month

No login. No dashboard. Plain English in your inbox.

If you want to dig deeper, ask Claude:
> *"Can you pull up more detail on last month's traffic?"*

---

## Going Independent — Your Options

Your site is yours. You are never locked into Mack & Lee.
At any point you can choose to take full control.
Here's what that looks like:

---

### Option 1 — Self-Managed (M&L handles infrastructure)

You continue managing content via Claude.
M&L continues handling hosting, analytics, pipeline maintenance,
and code-level changes.

Current cost: covered in your hosting agreement.
M&L involvement: Change Requests + sprints only.
Best for: clients who want professional oversight
without managing technical infrastructure.

---

### Option 2 — Full Independence (you take everything)

You take complete ownership of the site and all infrastructure.
M&L provides a complete handoff package and steps back entirely.

**What you receive:**
- Full source code (GitHub repo transferred to you)
- All documentation (`DEVHANDOFF.md` + full `/ml` folder)
- Credentials and account transfer checklist
- 30-day transition support window

**What you'll need:**
- A developer or AI developer to manage the codebase
- Compatible tools: Cursor, GitHub Copilot, Claude Code,
  or any AI with file-read/write + GitHub access
- Your own accounts: GitHub, Cloudflare, GA4, GTM, n8n (or equivalent)
- Estimated monthly infrastructure cost: $7-23/month
  (see `DEVHANDOFF.md` for full breakdown)

**What this means in practice:**
This is not a CMS. There is no visual editor.
All changes — content and structural — happen through
code or AI-assisted code editing.

You or your team will be responsible for:
- Reviewing every AI-generated change before it goes live
- Maintaining code quality and design consistency
- Managing the deployment pipeline
- Keeping dependencies updated

Without M&L's review layer, the discipline of
checking AI output before publishing falls entirely on you.
This is manageable — but it requires someone who understands
the codebase or is comfortable directing an AI that does.

**To initiate:** Contact Mack & Lee. We'll set a transition
date, transfer all accounts, and deliver the handoff package.
Nothing gets shut down until everything is confirmed working on your end.

---

### Option 3 — Handoff to Another Developer or AI Team

You want a different developer, agency, or in-house team
to take over. Mack & Lee steps back.

**What they'll need:**
- `DEVHANDOFF.md` — complete technical guide
- Access to the GitHub repo
- All environment variables (provided in handoff)
- Compatible build tools: any modern JavaScript environment

**What any competent developer gets:**
A well-documented, standard Astro + Tailwind codebase.
No proprietary tools. No unusual dependencies.
Any developer familiar with Astro can take this over
within a few hours of reading the documentation.

**What any AI developer gets:**
Load `ML_AGENTS.md`, `HANDOFF.md`, and `DESIGN.md`
as context. The AI will have full understanding of
the codebase, design system, and content rules.
Compatible with: Cursor, GitHub Copilot, Claude Code,
Gemini, or any AI with file access.

**M&L's involvement after handoff:** None, unless you
choose to re-engage for a future project.

**To initiate:** Same as Option 2 — contact Mack & Lee,
agree a transition date, transfer everything cleanly.

---

## Summary — What to Remember

| Topic | Key point |
|-------|-----------|
| Day-to-day content | You → Claude → live site |
| Code changes | Claude creates Change Request → M&L reviews → you approve |
| Status updates | Email notifications + ask Claude anytime |
| M&L's role | Quality control and strategic oversight, not labor |
| Monthly insights | Automatic email report, 1st of each month |
| Your ownership | Full — repo, content, data, everything |
| Lock-in | None — full handoff available anytime |
| Going independent | Three options, all documented, all clean |

---

## Questions?

**Content and site questions:** Ask Claude first.
If Claude can't answer, it will tell you and recommend
contacting Mack & Lee.

**Technical or billing questions:** [M&L contact]

**To discuss your service options:** [M&L contact]

---

*Built by Mack & Lee. Documented for your independence.*

