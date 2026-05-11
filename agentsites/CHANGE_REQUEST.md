# CHANGE REQUEST SYSTEM — Mack & Lee
> Defines the infrastructure and process for managing code-level
> change requests across all Track A client sites.
> Lives in `agentsites/`. Referenced by `ML_ADMIN.md` and `ARCHITECTURE.md`.
> Version: 1.0

---

## Overview

The Change Request system is the backbone of the AI-first
content management workflow. It bridges the gap between:

- What the client can do directly (content via Claude)
- What requires code (structural changes via Cursor + M&L review)

The system is built on **GitHub Issues** — free, AI-native,
linked directly to the repo, readable by any developer or AI tool.
The client never touches GitHub. Their experience is entirely
through Claude conversation and email.

---

## Why GitHub Issues

- **Free** — included in GitHub Free plan, no additional cost
- **AI-native** — Claude, Cursor, and Copilot all read Issues natively
- **Repo-linked** — every Issue lives next to the code it affects
- **Auditable** — full history of every request, decision, and change
- **Portable** — travels with the repo on client handoff
- **Milestone support** — built-in sprint bundling via GitHub Milestones
- **No extra tool** — M&L already works in GitHub

---

## How It Works — End to End

```
1. CLIENT makes a request in Claude
        ↓
2. CLAUDE determines: content change or code change?
        ↓ (if code change)
3. CLAUDE creates a GitHub Issue (structured template)
        ↓
4. N8N detects new Issue → emails client (confirmation)
   N8N detects new Issue → emails M&L (review notification)
        ↓
5. M&L reviews Issue in GitHub
   Labels it: approve / defer / needs-info
        ↓
6. If APPROVED:
   Claude picks up the Issue, implements the change
   Pushes to staging branch
   Cloudflare creates preview deploy automatically
        ↓
7. N8N detects staging deploy → emails client:
   "Your change is ready to review: [staging URL]"
        ↓
8. CLIENT reviews staging in browser
   Tells Claude: "Looks good" or "Change X"
        ↓
9. If approved: Claude merges to main → production deploy
   N8N emails client: "Your change is live: [live URL]"
        ↓
10. GitHub Issue closed automatically on merge
```

---

## Change Classification

Claude classifies every request before acting.

### Content Change — Claude handles directly
No Issue created. Claude acts immediately.
- Blog posts (new, edit, delete)
- Landing pages (from defined schema)
- Copy updates on existing pages
- Image or video swaps
- Button text changes
- Simple data updates (partner list, team members)

### Code Change — Issue required
Claude creates an Issue. M&L reviews before implementation.
- New section type or layout pattern
- New page template
- Component redesign or modification
- Navigation changes
- New form or integration
- Tailwind config changes
- Schema changes to content collections
- Anything that affects multiple pages
- Anything that changes the design system

### Emergency — M&L notified immediately
Issue created AND M&L emailed with URGENT flag.
- Site is broken or inaccessible
- Security concern
- Data loss risk
- Payment or form processing failure

---

## GitHub Issue Template

Every Change Request Issue uses this template:

```markdown
## Change Request — [Client Name]

**Requested by:** Ken Jacobsen
**Date:** YYYY-MM-DD
**Complexity:** Minor / Moderate / Significant
**Recommendation:** Implement now / Bundle in next sprint

---

### What the client asked for
[Verbatim or close paraphrase of client's request]

### What this requires technically
[Claude's analysis of what needs to change in the codebase]

### What Claude has prepared
[What Claude has already done — spec, draft component, etc.]

### Design decisions needed
[Any decisions M&L needs to make before implementation]

### Affected files / components
- `src/components/sections/[Component].astro`
- `tailwind.config.mjs`
- etc.

### Definition of done
[What "complete" looks like — specific and testable]
```

---

## GitHub Labels

Standard labels applied to every repo:

| Label | Color | Meaning |
|-------|-------|---------|
| `change-request` | Blue | All CRs — applied automatically |
| `approved` | Green | M&L approved, Claude can implement |
| `deferred` | Yellow | Bundled to next sprint |
| `needs-info` | Orange | M&L needs clarification before deciding |
| `in-progress` | Purple | Claude is implementing |
| `staging-ready` | Teal | Preview deploy ready for client review |
| `client-approved` | Green | Client approved staging, ready to merge |
| `complete` | Gray | Merged to main, issue closed |
| `urgent` | Red | Emergency — M&L notified immediately |
| `ml-review` | Dark blue | M&L must review before client sees staging |

---

## GitHub Milestones — Sprint Bundling

Deferred Issues are assigned to a Milestone.
Milestones are named: `Sprint — [Month Year]`
Example: `Sprint — June 2026`

M&L creates Milestones at the start of each month.
Sprint contents are agreed with client in advance.
Client can see what's in their sprint by asking Claude:
> *"What's in my next sprint?"*

Claude reads the GitHub Milestone and summarizes it
in plain English. No GitHub login required for client.

---

## M&L Review — What to Look For

When reviewing a Change Request, M&L checks:

**Does it make sense?**
- Is the request clear and achievable?
- Does Claude's interpretation match what the client wants?

**Does it fit the design system?**
- Does it use existing components or need net-new?
- Does it respect the Tailwind token system?
- Does it match the visual standard of the site?

**Is Claude's approach correct?**
- Are the affected files right?
- Is the complexity estimate accurate?
- Is the implementation approach sound?

**Timing decision:**
- Implement now — isolated, low-risk, client needs it soon
- Bundle in sprint — involves layout/design, or can wait
- Needs info — unclear enough that M&L needs to ask client first

M&L review target: **within 1 business day** for standard requests,
**within 2 hours** for urgent.

---

## Client Review — Staging

When a change is ready for client review, they receive:

```
Subject: Your change is ready to review — Sustained Outcomes

Hi Ken,

Your requested change is ready to preview:

"[Summary of what was changed]"

Preview link: https://[branch].sustainedoutcomes.pages.dev

This is a private preview — only you can see it.
It looks and works exactly like your live site.

To approve: reply "looks good" or tell Claude "approve the change"
To request edits: tell Claude what you'd like adjusted

Once approved, the change will be live on your site
within 60 seconds.

Questions? Just ask Claude.

— Mack & Lee + Claude
```

---

## M&L Review Flag

For changes that affect design, layout, or the design system,
Claude adds the `ml-review` label before notifying the client.

This means M&L sees the staging version before the client does.
M&L can:
- Approve it for client review
- Adjust it before sending to client
- Override Claude's implementation

This preserves design integrity without adding friction
to routine content updates.

---

## Sprint Planning — M&L Process

Monthly, M&L reviews all deferred Issues and:

1. Confirms scope with client (email or Claude)
2. Assigns Issues to that month's Milestone
3. Estimates total effort
4. Quotes additional fees if scope exceeds retainer
5. Executes sprint in Cursor
6. All sprint changes go through staging review
7. Client approves sprint batch or individual items
8. Merged to main, all Issues closed

---

## Client Handoff — Change Request History

On full client independence handoff:
- All GitHub Issues travel with the repo
- Complete history of every change request, decision, and outcome
- New developer/AI can read Issues to understand site evolution
- No institutional knowledge lost

---

## Status — Client-Facing Language

Claude always uses plain language when discussing status.
Never say "the Issue was labeled" — say:

| GitHub state | What Claude tells Ken |
|-------------|----------------------|
| Issue created | "I've submitted this for review." |
| needs-info | "M&L has a question before they can proceed — I'll let you know." |
| approved | "M&L approved it. I'm working on it now." |
| deferred | "M&L recommended bundling this into your [Month] sprint. It's on the list." |
| staging-ready | "It's ready to preview — check your email for the link." |
| ml-review | "Almost ready — M&L is doing a final check first." |
| client-approved | "Got it. Publishing now." |
| complete | "It's live. [URL]" |

---

## Cost

| Item | Cost |
|------|------|
| GitHub Issues | $0 (free plan) |
| GitHub Milestones | $0 (free plan) |
| n8n notifications | Included in existing n8n workflows |
| **Total added cost** | **$0** |

---

## n8n Workflows Required

### Trigger: New Issue with label `change-request`
→ Email client: confirmation of submission
→ Email M&L: review notification with Issue link

### Trigger: Issue labeled `staging-ready` (and NOT `ml-review`)
→ Email client: staging preview link

### Trigger: Issue labeled `approved` (after `ml-review`)
→ Email client: staging preview link

### Trigger: Issue labeled `complete`
→ Email client: live confirmation with URL

### Trigger: Issue labeled `urgent`
→ Email M&L immediately: urgent flag + Issue link
→ Email client: "We're on it" acknowledgment

### Trigger: Milestone updated (sprint planning)
→ Email client: sprint summary in plain English

---

## Implementation Notes for Cursor

When building the Claude API pipeline:
- Use GitHub API to create Issues programmatically
- Use GitHub API to read label changes (webhook or polling)
- Store `GITHUB_TOKEN` as environment variable (fine-grained PAT)
- Token needs: Issues read/write, Contents read/write on staging branch only
- Never give pipeline token access to main branch directly
  — all main branch merges go through pull request

