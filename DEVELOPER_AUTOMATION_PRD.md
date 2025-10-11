# CortexBuild Developer Automation Platform PRD

## 1. Executive Summary
Deliver a Procore-aware automation studio that lets construction developers design, test, deploy, and monetize automations, agents, and connectors in a virtualized environment. The experience must blend robust DevOps tooling (workspaces, pipelines, AI co-pilots) with marketplace distribution, while honoring compliance and enterprise governance requirements.

## 2. Stakeholders & Roles
- **Executive Sponsor:** Adrian Stanca — sets vision, budget, executive alignment.
- **Product Lead:** Developer Experience PM — owns roadmap, backlog, success metrics.
- **Engineering Leads:**  
  - Dev Tooling (workspace provisioning, runtime)  
  - Automation Runtime (workflow engine, connectors)  
  - Marketplace & Billing (package schema, submissions)  
  - Platform Ops (observability, compliance)
- **Design / UX:** Developer platform designer — Automation Studio UX, marketplace flows.
- **Compliance & Security:** Security lead, Legal — SOC2, data residency, partner agreements.
- **Field Enablement:** Customer success, partner management — beta programs, training.

## 3. Goals & Success Metrics
| Goal | Metrics |
| --- | --- |
| Provide self-service dev envs | ≥80% of developers launch workspace <2 min; NPS ≥45 |
| Enable Procore-integrated automations | ≥20 certified connectors; 95% workflow success rate |
| Launch marketplace with monetization | ≥15 listings in 90 days; ≥5 paid installs |
| Ensure compliance | SOC2 Type II roadmap locked; all flows audited with RBAC |

## 4. Scope
### In Scope
- Workspace provisioning service (templates, lifecycle management, console integration).
- Automation runtime (trigger/action engine, simulation, execution logs).
- Visual canvas (flow builder) + code editor integration.
- Package manifest, submission/review pipeline, marketplace UI + install flow.
- Connector SDK with prioritized nodes (Procore RFIs, Submittals, Daily Logs, ERP).
- Governance (RBAC, audit logs, quota management) & observability dashboards.

### Out of Scope
- On-premise deployment support.
- Non-construction vertical connectors.
- Full billing engine (initial release leverages Stripe basic subscriptions).

## 5. Requirements
### Functional
1. **Workspace Provisioning MVP**
   - Templates with defined stacks & services; API + UI to create/resume/hibernate workspaces.
   - Integrate with existing Developer Console nav & ConstructionAutomationStudio UI.
   - Provide CLI (`cortex dev`) bootstrap commands, secrets injection, shared artifacts.
2. **Automation Runtime & Canvas v1**
   - Trigger catalog (Procore events, schedulers, webhooks) & action nodes.
   - Flow simulation with sandbox data and logs; deployment to runtime cluster.
   - Versioning & rollback, manual run triggers, AI-generated node suggestions.
3. **Package Manifest & Marketplace Submission**
   - Define `.cortexapp` manifest (metadata, permissions, dependencies, pricing).
   - Submission checklist, automated validations, reviewer workflow, release promotion.
   - Tenant install/uninstall API with permission scopes and billing hooks.
4. **Connector & Template Prioritization**
   - Tier-0 connectors: Procore RFIs, Submittals, Daily Logs, Budget, Observations.
   - Tier-1 connectors: Autodesk ACC, Slack Teams, SAP ERP, PowerBI.
   - Provide starter automation templates (Safety Escalation, Submittal Fastlane, Closeout Ops).

### Non-Functional
- Multi-tenant isolation; enforce resource quotas per workspace/env.
- Latency targets: workspace ready <120s; automation trigger-to-action <5s p95.
- Logging/metrics exported to existing observability stack; alerting for failure spikes.
- Compliance: SOC2 controls, data residency (US/EU), Procore API usage limits.

## 6. Dependencies & Risks
- **Infra:** Kubernetes or similar orchestrator for workspaces; VPC networking; Vault.
- **Security:** Secret handling, sandboxing (Firecracker/VM isolation), API rate limiting.
- **Partner Agreements:** Procore API licensing, Autodesk/SAP connectors.
- **Data:** Need representative construction datasets for simulation/testing.
- **Risk Mitigation:** Progressive rollout, canary pipelines, feature flags per tenant.

## 7. Release Plan & Timelines
| Phase | Timeline | Key Deliverables |
| --- | --- | --- |
| **Phase 0 – Alignment (Weeks 0-2)** | Stakeholder workshops; compliance gap analysis; finalize PRD & roadmap |
| **Phase 1 – Workspace Foundations (Weeks 2-6)** | Workspace service MVP, CLI, Developer Console integration, basic monitoring |
| **Phase 2 – Automation Runtime & Canvas (Weeks 6-12)** | Workflow engine v1, canvas UI, execution logs, AI assist MVP |
| **Phase 3 – Marketplace (Weeks 12-18)** | Manifest schema, submission flow, reviewer console, install/uninstall | 
| **Phase 4 – Connectors & Templates (Weeks 18-24)** | Certified connectors, automation templates, documentation, GTM readiness |

## 8. Compliance & Governance
- Document data flow & storage locations; align with Procore data handling policies.
- RBAC matrix for developer/admin roles; audit trails for flows, deployments, marketplace actions.
- Incident response plan for failed automations/webhook outages; SLA definitions.

## 9. Open Questions
1. Workspace hosting model preference (managed vs customer cloud integration)?
2. Billing strategy for marketplace (rev-share, subscription, credit packs)?
3. Level of AI assistance acceptable under compliance guidelines?
4. Need for offline-capable field automations in initial release?

## 10. Next Steps
1. Review PRD with stakeholders; capture feedback and sign-off.
2. Groom Phase 1 backlog; assign engineering squads.
3. Stand up prototype workspace environment and integrate status into Automation Studio.
4. Define manifest JSON schema and submission acceptance criteria.
5. Finalize prioritized connector roadmap and secure API credentials/sandbox access.
