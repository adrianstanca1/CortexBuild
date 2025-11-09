# 🏗️ NewEra-CortexBuild — Strategic Program Plan

## 1. Vision
- Deliver a unified, AI-native construction management SaaS that is accessible to mid-market and small contractors.
- Combine operational tooling (estimating, project ops, finance, field collaboration) with automation agents that remove manual work.
- Ensure modular deployment so customers can start with a lightweight core and grow into advanced capabilities without migrations.

## 2. Guiding Principles
1. **Operational Breadth, Depth via Modules** — ship an essential core (projects, documents, labor, invoices) and allow advanced vertical modules (prefab coordination, sustainability, safety).
2. **AI Everywhere** — conversational copilots, schedule/forecast bots, automated document extraction, and agent orchestration for repetitive tasks.
3. **Open, Extensible Platform** — SDK, webhooks, and data warehouse connectors for integrators; embrace MCP & Agent Kit for automation ecosystems.
4. **Small-Team Friendly** — opinionated defaults, prescriptive workflows, low setup, and mobile-first UX for field crews.
5. **Compliance & Trust** — audit trails, RFI/submittal workflows, safety logs, SOC2-ready controls, per-tenant encryption.

## 3. Target Personas
- **Operations Director / Project Executive** — needs portfolio analytics, risk signals, profitability guardrails.
- **Project Manager / Coordinator** — drives RFIs, submittals, change orders; wants streamlined document + communication flows.
- **Field Superintendent / Foreman** — requires offline-first daily logs, punch tracking, schedule insights.
- **Finance & Accounting** — integrates pay apps, invoices, labor costs, lien waivers.
- **Trade Partners & Suppliers** — lightweight vendor portal for submissions, payments, procurement.

## 4. Competitive Inspiration & Differentiators
| Platform | Strengths | Gaps NewEra Targets |
| --- | --- | --- |
| Procore | Enterprise breadth, integrations | Heavy/expensive for small shops, limited AI-first automation |
| Autodesk Build | Strong design/drawing workflows | Less focus on financial automation + SMB affordability |
| Buildertrend/Jobber | SMB friendly, simple setup | Shallow enterprise workflows, limited extensibility |
| UpCodes / PlanGrid | Drawing + code insights | Not full lifecycle, lacks automation + finance |

**NewEra Edge**
- Embedded AI copilots for every workflow (submittal drafting, budget forecasts, contract review).
- Agent-based automation studio with prebuilt recipes for small teams.
- Unified data fabric + BI-ready warehouse outputs for modern analytics stacks.
- Multi-tenant-by-default infrastructure with per-tenant compute scaling and offline-first sync.

## 5. Program Pillars
1. **Core Platform (MVP)** — Auth, tenancy, org setup, projects, documents, RFIs, tasks, financials, field tools.
2. **Automation & AI Studio** — Workflow graph builder, agent templates (procurement, scheduling, safety), MCP integrations.
3. **Developer Ecosystem** — SDK, CLI, low-code widgets, marketplace for partner modules.
4. **Data & Insights** — Real-time dashboards, predictive models (delay risk, cash flow), data warehouse exports.
5. **Deployment & Ops** — Multi-cloud ready (Vercel/Edge for SPA, containers for API), infrastructure as code, observability.

## 6. Release Trains
| Phase | Goal | Key Deliverables |
| --- | --- | --- |
| **Alpha (6 weeks)** | Functional core for pilot GC | New workspace scaffold, auth, project hub, RFIs, tasks, document storage, AI assistant v1 |
| **Beta (8 weeks)** | Production-ready SMB SKU | Financials (budgets/invoices), subcontractor portal, automation studio v1, deployment pipelines |
| **GA (6 weeks)** | Scale + developer ecosystem | SDK, marketplace, advanced analytics, compliance tooling, mobile packaging |

## 7. Technical Architecture (High-Level)
- **Frontend**: React (Vite) SPA, component library with Tailwind, module federation-ready structure for future plug-ins, offline cache via Service Worker.
- **Backend**: Node/Express (TS) with modular service layers, Prisma or Drizzle for DB abstraction, multi-tenant Postgres (primary) with SQLite dev mode, event bus (Redis/NATS) for async processing.
- **AI Layer**: Abstraction over OpenAI/Gemini + custom models, conversation orchestration, retrieval with pgvector/Weaviate, agent runtime leveraging MCP + custom tools.
- **Automation Engine**: Workflow DSL + runtime, agent scheduling, monitoring, fallback/rollback logic.
- **Data Platform**: ETL jobs into warehouse (Snowflake/BigQuery), metrics layer, embedded analytics.
- **DevOps**: IaC (Pulumi/Terraform), GitHub Actions CI/CD, feature flagging, canary deploys, comprehensive observability (OpenTelemetry).

## 8. Workstreams & Owners (to be assigned)
1. **Platform Foundations** — tenancy, auth, permissions, auditing.
2. **Field Operations Suite** — daily logs, punch, photos, offline mobile.
3. **Financial Automation** — budgets, pay apps, subcontract billing, Stripe payouts.
4. **Automation/AI Studio** — workflow builder, agent templates, integrations.
5. **Developer Ecosystem** — SDK, CLI, marketplace APIs.
6. **Data & Intelligence** — analytics, ML models, forecasting.
7. **Infrastructure & SecOps** — deployment, monitoring, compliance.

## 9. Immediate Next Steps
1. Finalize scope boundaries for Alpha MVP and lock feature checklist.
2. Spin up `newera-cortexbuild` workspace with clean Git history and seed modules.
3. Establish architecture decision records (ADRs) for key tech choices.
4. Define success metrics + telemetry instrumentation per module.
5. Plan pilot customer onboarding + feedback loop.

---
Prepared by: NewEra Program Office (Codex)  
Date: `2025-02-14`
