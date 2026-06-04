---
title: "Governance and the Living System"
description: "Making It Last"
order: 7
---
There is a graveyard in every design organization. It is not marked, and no one talks about it. But everyone knows where it is. It is where the style guides go.

Design systems decay. Not because teams stop caring. Not because the work was bad. They decay because of a structural problem: the system is built as an artifact, not a product. It is launched, handed off, and expected to maintain itself. It does not.

As Nathan Curtis put it: a style guide is an artifact of design process. **A design system is a living, funded product with a roadmap and backlog, serving an ecosystem.**

An ADS has one more requirement: it must be **continuously verifiable**. Because AI agents are querying it, the manifest cannot drift from reality and silently produce wrong output. By the time anyone notices, the damage is widespread.

Governance is the infrastructure that keeps the system honest. And in an ADS, governance is not optional.

---

## The Four Loops

An ADS stays alive through four feedback loops, operating at four different cadences. Together, they form a continuous, self-correcting system.

---

### Loop 1: Continuous (Every Merge)

The fastest loop fires on every commit to any consumer codebase. The commit triggers a manifest validation. If violations are found, CI fails and the commit is rejected.

Over time, the pattern of continuous loop failures tells you something valuable: if the same Contract is violated repeatedly by different teams, the Contract is probably too strict, too unclear, or misaligned with how teams actually need to use that component.

---

### Loop 2: Weekly (Signal Triage)

Once a week, the manifest owner reviews the past seven days of manifest activity across three categories:

**Override rates.** How often did developers or agents bypass the manifest to hardcode values? A rising override rate indicates a gap.

**Validation failure patterns.** Which Contracts are failing most frequently? Which violations are new versus recurring? Which failures come from AI agent output versus human commits?

**Query patterns.** Which Intents are queried most? Which are never queried? An Intent that is never queried may be misnamed or redundant.

The manifest owner categorizes each signal into:
- **System gaps** — add the missing pattern to the manifest
- **Ambiguous rules** — clarify the constraint language
- **Genuine violations** — requires a conversation, not a manifest change

---

### Loop 3: Monthly (Semantic Updates)

Once a month, the design system team ships a manifest update following semantic versioning:

- **Additive changes** (new Signals, Intents, Contracts) → minor version increment
- **Breaking changes** (renamed Signals, removed Contracts, changed constraint rules) → major version increment
- **Patch versions** → documentation corrections that do not change behavior

Breaking changes automatically trigger:
1. A structured diff notification to all consumer teams whose codebases depend on the changed element
2. An auto-generated migration guide — specific, actionable, codebase-aware:

```
BREAKING CHANGE: Contract "Button" - version 4.0.0

Changed: `label` prop max length reduced from 48 to 32 characters

Affected usages in your codebase:
  - account/components/DeleteAccount.tsx:22
    Current label: "Permanently delete my account and all data" (43 chars - VIOLATION)
    Suggestion: "Delete account permanently" (26 chars)
```

Teams receive this automatically. They do not need to audit their codebases manually.

---

### Loop 4: Quarterly (Full Audit)

Every quarter, the manifest owner leads a full audit of the semantic layer, asking a question the continuous and weekly loops cannot answer: **does the manifest still reflect how products are actually being built?**

The quarterly audit compares the manifest against a sample of recent product output — screens, components, and flows built over the past quarter, by both human designers and AI agents. For each discrepancy:
- Is this a **violation** (the product is wrong)?
- Is this a **gap** (the manifest is missing something)?

The audit also examines the vocabulary of the manifest itself. Are Intent names still meaningful? Are there Signals that have never been queried, suggesting they are redundant or misnamed?

---

## The Manifest Owner in Depth

The manifest owner is not the gatekeeper of the design system. They are the **steward of the semantic layer** — the person accountable for the manifest's correctness and currency.

Gatekeeping creates friction that slows the system down. Stewardship creates trust that speeds it up.

**Weekly:** Reviews signal dashboard. Categorizes signals into system gaps, ambiguous rules, genuine violations. Responds to Contract change proposals.

**Monthly:** Ships the manifest release. Authors or reviews all changes to Signal and Intent layers. Approves Contract changes. Publishes migration guides for breaking changes. Reviews AI agent output samples.

**Quarterly:** Leads the full audit. Presents findings to design system leadership. Sets strategic direction for the manifest's next quarter of evolution.

**Ongoing:** Point of contact for teams with questions. Maintains Signal naming standards. Participates in design reviews where new patterns are being established.

**What the manifest owner is NOT:** a solo operator, a bottleneck, or an optional role. Staff the manifest owner before launch.

---

## Making the System Approachable

A technically excellent manifest is useless if the teams consuming it cannot figure out how to query it.

**For AI agents:** the query endpoint must return immediately actionable responses. No further interpretation required. The response tells the agent exactly what component to use, what tokens to apply, and what constraints to respect.

**For human engineers:** the validation endpoint must return specific, actionable error messages. Not "Contract violation: Button." But "Contract violation: Button at checkout/PaymentForm.tsx:147. The 'label' prop is 43 characters. Maximum allowed is 32."

**For human designers:** the manifest must be surfaced in the tools they already use. Figma plugins that query the manifest. Documentation sites that pull from the manifest rather than being written separately.

---

## The Human Terrain

Here is an observation every design systems practitioner eventually arrives at: **the hardest part of building a design system is not the assets. It is the people.**

An ADS can be technically excellent and organizationally ignored. Only the organizational work protects it.

**Build relationships before building infrastructure.** Talk to consumer teams before the manifest server is live. What are they building? What are their biggest friction points? Consumer teams who feel heard are far more likely to adopt the system.

**Make contribution visible and rewarding.** When a product team identifies a gap and files a Contract change proposal, acknowledge it, act on it, and credit the contributing team publicly. Contribution should feel like participation, not bureaucracy.

**Education as ongoing practice.** Onboarding a team to ADS is not a one-time event. The system evolves. New team members join. New tools enter the workflow. The design system team's investment in education is the adoption mechanism.

**Measure what matters.** Time-to-market reductions and accessibility regression rates matter to leadership. Override rates and Contract change velocity matter to the design system team. Track both. Communicate each to the audience it speaks to.

The assets are the easy part. The architecture is harder. The workflows are harder still. **The relationships and the culture are the hardest and the most important.**

---

## Making It Official

An ADS requires official status because its infrastructure requires ongoing investment that only comes with organizational commitment.

**A dedicated team.** Not designers and engineers who work on the ADS between other responsibilities. A ratio of roughly one design system team member per ten to fifteen consuming engineers is a reasonable starting point.

**A product roadmap.** The ADS is a product. It has a roadmap, a backlog, a release cadence, and metrics that define success.

**A funding model.** The most common: a tax where each product team consuming the design system contributes a percentage of their engineering capacity to fund the design system team. This aligns incentives correctly.

---

## Done Is Never Done

A design system is never done. The product evolves. The brand evolves. The platforms evolve. New AI agents enter the workflow. New surfaces are added. Old patterns become obsolete.

The goal of governance is not to build a system that never needs to change. It is to build a system that **can change gracefully** — one that catches the changes it needs to catch, surfaces the gaps it has developed, and evolves the semantic layer to stay current with the products it serves.

A design system with excellent governance is not a finished artifact. It is a living, breathing, continuously improving product that gets better every quarter because the team that builds it has structured their work to make that improvement systematic.

That is what makes it last.
