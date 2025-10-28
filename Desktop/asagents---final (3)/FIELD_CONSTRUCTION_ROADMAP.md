# Field‑First Construction App — Roadmap, Mindmap & Wireframes

> Scope: small construction firms (5–100 field staff). Prioritize on‑site capture, offline use, and fast approvals.

---

# 1) Product Roadmap (phased, pragmatic)

## Goals (north star)

* Reduce admin time for foremen by **>30%**.
* Achieve **95%** daily log submission rate by Day 30 of pilot.
* Cut RFI response cycle by **25%** via capture-at-source.
* Convert **>80%** of signed T&M tickets into CO drafts automatically.

## Assumptions

* Mixed device fleet (iOS + Android). Patchy connectivity on sites.
* Accounting in QuickBooks Online or Xero; drawings come from Drive/OneDrive/Dropbox.

## Phase 0 — Foundations (Week 0–1)

* Tech stack: React Native, SQLite/WatermelonDB, background sync, file CDN, push.
* Design system: tokens (colors/spacing/typography), Tailwind baseline, icon set.
* Data model v1: Projects, Drawings+Revisions, Tasks, RFIs, T&M, Deliveries, DailyLogs, TimeEntries, Crews, CostCodes, Photos.

**Deliverables:** repo + CI, design token file, clickable empty shell (Home → Project → Plans).

## Phase 1 — Discovery & Field Validation (Weeks 1–2)

* 3–5 ride‑alongs; shadow foremen. Time–motion study of daily log + T&M.
* Artifact audit: sample daily logs, T&M tickets, delivery slips, toolbox talks.

**Deliverables:** validated form templates (Daily Log, T&M, Delivery, Talk), workflow maps, acceptance criteria.

## Phase 2 — UX/Wireframes & Prototypes (Weeks 2–4)

* Low‑fi wireframes for the 6 core screens (below) → mid‑fi clickable prototype.
* Usability tests with 5–7 field users; iterate twice.

**Deliverables:** this document + prototype; microcopy; empty‑state/ offline patterns.

## Phase 3 — MVP Build (Weeks 4–10)

**Sprint A (wk 4–6):**

* Offline framework + conflict rules; Auth; Project/crew home (My Day).
* Clock in/out with geofence reminders; Time entries by cost code.
* Photo capture with auto‑tag (project/date/location).

**Sprint B (wk 6–8):**

* Daily Log v1 (labor, quantities, blockers, weather auto‑pull).
* Plans viewer (PDF fast load, search, sheet index, pin‑drop tasks, simple markup).
* Tasks/Punch list from plan pins; basic exports.

**Sprint C (wk 8–10):**

* T&M tickets v1 (labor+materials+equipment, client e‑sign on device).
* Deliveries/receiving (scan QR/barcode, quantity received vs PO manual entry, photo proof).
* Safety: Toolbox Talk attendance & signatures.

## Phase 4 — Pilot (Weeks 10–12)

* Roll out to 1–2 projects, 10–20 field users.
* Embedded support; bug‑burn down; measure KPIs.

**Exit criteria:** 95% daily log compliance; <2 taps to photo‑attach; 0 data loss offline→online; 80% T&M signed on site.

## Phase 5 — Hardening & Light Analytics (Weeks 12–15)

* Performance on large plans; conflict edge cases; audit trail; PDF/CSV reports.
* Dashboard v1: units installed vs plan; RFI aging; talks completed.

## Phase 6 — Phase‑2 Features (Weeks 15–20)

* Change management (PCE→CO), CO PDFs; 3‑week look‑ahead board; Equipment QR check‑in/out.
* RFIs advanced (email‑in, due dates, status SLA timers); Client portal read‑only.

## Risks & Mitigations

* **Plan file bloat** → incremental PDF renderer, on‑device cache.
* **Adoption** → 2‑min daily log, voice‑to‑text, big buttons, minimal typing.
* **Connectivity** → offline‑first with merge previews + last‑write‑wins per field.
* **Data trust** → role‑based approvals, immutable signatures, exports.

## Team & Responsibilities

* Product/UX (1), Mobile Eng (2–3), Backend (1–2), QA (1 shared), PM/Owner (0.5), Field Champion (one foreman per pilot site).

## KPIs & Instrumentation

* Daily log submission %, average taps per log, RFI cycle time, T&M signed rate, delivery discrepancies flagged, crash‑free sessions.

---

# 2) Mindmap (field‑first focus)

```
Construction App (Field‑First)
├── Field Modules
│   ├── Clock In/Out (Geofence)
│   ├── Daily Log (Weather, Photos, Voice)
│   ├── Plans Viewer (Pins, Markups)
│   ├── Tasks/Punch (Statuses, Sign‑off)
│   ├── RFIs (from Plan Pins)
│   ├── T&M Tickets (Client E‑Sign)
│   ├── Deliveries/Receiving (Scan)
│   ├── Safety (Talks, JHA, Incidents)
│   └── Equipment/Tools (QR, Hours)
├── Office Modules
│   ├── Project Overview
│   ├── Document Control (Revisions)
│   ├── Change Management (PCE→CO)
│   └── Procurement/POs
├── Cross‑Cutting
│   ├── Offline‑First + Sync
│   ├── Universal Capture (+ button)
│   ├── Photos (Tags, Markup)
│   ├── Templates Library
│   ├── Approvals/Notifications
│   └── Roles & Audit Trail
├── Integrations
│   ├── Accounting (QBO/Xero)
│   ├── Cloud Storage (Drive/OneDrive)
│   ├── E‑Sign (DocuSign)
│   └── Weather API
├── Data Model
│   ├── Projects, Locations
│   ├── Drawings/Revisions, Specs
│   ├── Tasks, RFIs, Submittals, COs
│   ├── DailyLogs, TimeEntries
│   ├── T&M, Deliveries, Materials
│   └── Photos, Vendors, Contacts
└── Analytics
    ├── Field Productivity
    ├── Schedule Health
    ├── Quality & Safety
    └── Commercial (T&M→CO)
```

---

# 3) Low‑Fidelity Wireframes (mobile‑first)

> Note: These are lo‑fi to validate flows/tap counts. Each includes primary actions and offline cues.

## 3.1 Home / My Day

```
┌─────────────────────────────────────┐
│  My Day           [☰]     Project ▼ │
├─────────────────────────────────────┤
│ ⏱ Clock In  [Geofence ON]          │
│  Last: 07:12   Cost Code: ▽        │
├─────────────────────────────────────┤
│ Due Today                           │
│  • Daily Log (North Tower)  ▶       │
│  • Toolbox Talk 07:30        ▶      │
│  • 3 Tasks assigned           3     │
├─────────────────────────────────────┤
│ Quick Capture  [+ Photo]  [+ Task]  │
│  [+ T&M]  [+ Delivery]  [+ RFI]     │
├─────────────────────────────────────┤
│ Activity (Today)                    │
│  08:05  12 photos uploaded          │
│  08:22  Delivery: drywall partial   │
└─────────────────────────────────────┘
```

**Primary actions:** Clock, Quick Capture, open due items.
**Offline UX:** banner "Offline — capturing locally"; greyed sync icon.

## 3.2 Project Home

```
┌─────────────────────────────────────┐
│  North Tower        [Search 🔎]     │
├─────────────────────────────────────┤
│ [Plans]  [Tasks]  [Daily Log]       │
│ [RFIs]   [T&M]    [Deliveries]      │
│ [Safety] [Photos] [Schedule]        │
├─────────────────────────────────────┤
│ Open Items                          │
│  RFIs: 2 waiting   Punch: 5         │
│  Today's talk: Confined Space       │
└─────────────────────────────────────┘
```

## 3.3 Plans Viewer (pins + markups + create RFI)

```
┌─────────────────────────────────────┐
│ A‑102  Rev 5        [Sheets ▽]      │
├─────────────────────────────────────┤
│  [  PDF viewport with pinch‑zoom ]  │
│  [  🔵 pin ]  [ 🔴 markup ]          │
├─────────────────────────────────────┤
│  + Task   + RFI   Compare (v4/v5)   │
└─────────────────────────────────────┘

→ Tap +RFI from a pin
┌─────────────────────────────────────┐
│ New RFI from A‑102 @ Grid C5        │
├─────────────────────────────────────┤
│ Title: __________________________   │
│ Assignee: PM ▽   Due:  Fri ▽        │
│ Photos/Markups: [add]               │
│ Notes:  🎙 Voice to text            │
├─────────────────────────────────────┤
│ [Save Draft]        [Submit]        │
└─────────────────────────────────────┘
```

**Primary actions:** Pin, Task, RFI, Compare.
**Edge cases:** Large PDFs show skeleton tiles; markups cached offline and merged by layer.

## 3.4 Daily Log (2‑minute flow)

```
┌─────────────────────────────────────┐
│ Daily Log — North Tower  (Today)    │
├─────────────────────────────────────┤
│ Weather:  12°C  Light Rain  2 m/s   │
│ Labor Hours: [ + Crew ]  Total: 18  │
│ Quantities Installed: [ + ]         │
│ Equipment: [ + ]                    │
│ Photos: [ 12 ]  Add ▶               │
│ Blockers / Notes:  🎙               │
├─────────────────────────────────────┤
│ [Save]                 [Submit]     │
└─────────────────────────────────────┘
```

**Primary actions:** Add crew, quantities, photos, submit.
**Validation:** Require either labor or quantities; warn if missing photos.

## 3.5 T&M Ticket (client e‑sign)

```
┌─────────────────────────────────────┐
│ T&M — Extra framing at Level 3      │
├─────────────────────────────────────┤
│ Labor  [ + Add line ]               │
│  • 2x Carpenter  4.0h @ CC‑201      │
│ Materials [ + ]   Equipment [ + ]   │
│ Photos/Sketch: [ add ]              │
├─────────────────────────────────────┤
│ Client Name: ____________           │
│ Signature:  ✎  (capture area)       │
├─────────────────────────────────────┤
│ [Save Draft]      [Get Signature]   │
└─────────────────────────────────────┘
```

**Primary actions:** Add lines, capture signature.
**Post‑submit:** Auto‑generate CO draft; email PDF to PM.

## 3.6 Deliveries / Receiving (scan first)

```
┌─────────────────────────────────────┐
│ Delivery — Packing Slip #PS‑1842    │
├─────────────────────────────────────┤
│ [ Scan QR/Barcode ]  or  [ Manual ] │
│ Item                 Ordered  Recvd  │
│ Drywall 5/8"           100     60 ▢  │
│ Fasteners (box)         10     10 ✓  │
│ Notes / Photo: [ add ]              │
├─────────────────────────────────────┤
│ [Partial Receive]   [Complete]      │
└─────────────────────────────────────┘
```

**Primary actions:** Scan, partial/complete receive, add photo.
**Alert:** PM auto‑notified on shortages.

## 3.7 RFIs — List & Detail

```
┌─────────────────────────────────────┐
│ RFIs (Project)   [New RFI]  [Filter]│
├─────────────────────────────────────┤
│ #014  Open  Due Fri  Beam clash     │
│ #013  Answered  Spec detail 07  ▶   │
│ #012  Open  Due Wed  Sleeve loc.    │
├─────────────────────────────────────┤
│ RFI #014 — Beam clash @ C5          │
│  From: A‑102 Rev 5 (pin)            │
│  Assignee: Architect  Due: Fri      │
│  Thread: [ messages / photos ]      │
│  Actions: [Add Comment] [Close]     │
└─────────────────────────────────────┘
```

---

# 4) Acceptance Criteria (MVP cutline)

* **Daily Log:** complete in ≤120s; autosave every 5s; works 100% offline.
* **Plans:** open a 20MB sheet in ≤2s after first cache; add pin ≤2 taps.
* **T&M:** signature box never scrolls; PDF generated locally; unique hash ID.
* **Deliveries:** scan → line item recognized in ≤1s; partial receive allowed.
* **Clock:** geofence reminder fires within 60s of entry/exit; manual override.

---

# 5) Reporting & Exports (v1)

* Daily logs (PDF bundle by date range/project).
* T&M tickets (PDF per ticket + CSV roll‑up).
* Deliveries (CSV discrepancies list).
* Photos (zip by day or sheet).

---

# 6) Next Steps

1. Confirm cutline + KPIs.
2. Approve wireframes.
3. Build mid‑fi prototype for tap‑test with 5 field users.
4. Start Sprint A.

---

# 7) Implementation Status

## ✅ Completed Features

- [x] React 19.2.0 with latest TypeScript
- [x] Vite 6.2.0 build system
- [x] Comprehensive component library
- [x] AI-powered features (Gemini integration)
- [x] Multi-provider AI system (Gemini, OpenAI, Anthropic)
- [x] Map-based project visualization
- [x] Real-time collaboration features
- [x] Document management system
- [x] Time tracking and invoicing
- [x] Safety analysis tools
- [x] Equipment management
- [x] Financial tracking
- [x] Comprehensive progress tracking
- [x] Deployment scripts for multiple platforms

## 🚧 In Progress

- [ ] Offline-first architecture with WatermelonDB
- [ ] Mobile app (React Native)
- [ ] Geofence-based clock in/out
- [ ] QR/Barcode scanning for deliveries
- [ ] Voice-to-text for field notes
- [ ] PDF viewer with markup tools

## 📋 Planned Enhancements

- [ ] Integration with QuickBooks/Xero
- [ ] DocuSign integration
- [ ] Weather API integration
- [ ] Advanced analytics dashboard
- [ ] Client portal
- [ ] Equipment QR check-in/out system
