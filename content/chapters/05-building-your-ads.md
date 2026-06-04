---
title: "Building Your ADS"
description: "From Audit to Launch"
order: 6
---
Talk is cheap. The hardest part of building an Agentic Design System is not the schema design or the API architecture. It is the organizational work of making it happen inside a real company, with real teams, real constraints, and real competing priorities.

---

## The Two Paths

**Greenfield (building from scratch):** Start ADS-first from day one. Write Contracts before you write component code. Build the manifest server before you build Storybook. The process flows cleanly.

**Migration (most organizations):** You have existing design systems. Often more than one. Migration is not a replacement project — it is a **layering project**. You build the semantic layer underneath the existing system and gradually align the component library to the new foundation.

---

## Step 1: The Interface Inventory

The interface inventory remains one of the most valuable exercises in design systems work. But in ADS, the goal shifts:

- Traditional: *What does it look like? What components does it contain?*
- ADS: *What is it for? What Intent does it satisfy? What design decisions does it encode?*

This reframing transforms the inventory from a visual audit into a **semantic audit**.

---

## Step 2: The Semantic Audit

The semantic audit is the most important and most unfamiliar part of building an ADS. It is the process of converting implicit design knowledge into explicit, machine-readable rules.

Every design system carries implicit knowledge — the kind of thing a senior designer knows intuitively but has never been written as a formal rule. The semantic audit surfaces all of this and encodes it explicitly.

**Questions to drive the semantic audit:**
- What is this color for? Where is it valid? Where is it explicitly not valid?
- What does this spacing value signify? Is it component-level or layout-level?
- What is this component for? What user goal does it satisfy? What conditions make it invalid?
- Are there patterns we've been building the same way for years but have never documented?

The friction of the semantic audit is the value of the semantic audit. It reveals decisions that different designers have been making differently for years without realizing it.

---

## Step 3: Build the Signal Layer

With the semantic audit complete, formalize it:

1. Define primitive tokens — the full palette
2. Define semantic tokens — mapping design purposes to primitive values
3. Define component tokens — scoped mappings per component

As you define each semantic token, add the constraint metadata that transforms it from a named value into a Signal:

```yaml
signal:
  name: color.status.error
  value: "{color.red.600}"
  semantic_role: error-state-indicator
  valid_in: [text, border, icon]
  invalid_in: [background, button-fill, decorative-element]
  constraint: must-be-accompanied-by-error-message
  accessibility: wcag-aa-minimum-contrast-required
```

A Signal with an incomplete constraint is better than a hardcoded value — refine constraints over time.

---

## Step 4: Write the Contracts

Start with your **ten most-used components**. For each, resist the temptation to look at the existing implementation and describe it. Start from the Intent the component satisfies.

Ask:
- What Intent does it satisfy?
- What props does it require to be semantically valid?
- What variants does it support, and when is each appropriate?
- What constraints must never be violated?
- What does this component explicitly forbid?

The Contract is a co-owned artifact: designers own the semantic rules, engineers own the implementation specifications. Both sides must sign off.

---

## Step 5: Build the Manifest Server

Regardless of implementation approach, your manifest server must expose the five endpoints described in Chapter 4.

**The validation endpoint is the most important one to get right first.** It is what connects the manifest to your CI/CD pipeline. The moment your CI pipeline fails on a manifest violation is the moment the ADS becomes real for your engineering teams.

---

## Step 6: Write the Protocols

For each major product surface, write a Protocol. Start with your highest-traffic surfaces. Do not try to write Protocols for every possible surface before launching.

```yaml
protocol:
  name: checkout-payment-step
  surface: checkout
  step: payment
  platform: mobile-web
  theme: brand-a
  intent_resolutions:
    primary-action:
      resolves_to: Button
      variant: primary
      label: "Complete purchase"
      position: bottom-fixed
    error-state:
      resolves_to: InlineError
      signal: color.status.error
  constraints:
    - primary-action must be disabled until form is valid
    - error-state must appear inline adjacent to the invalid field
    - no secondary-action on this surface
```

---

## Selling ADS to Leadership

The case for ADS is, at its core, a **financial case**. Start with the redundancy audit: calculate how much your organization is spending on redundant component work. Make the cost of the current state visible and concrete.

Then present the validated hypothesis: a unified, theme-agnostic Agentic Design System can **reduce time-to-market for new product surfaces by more than fifty percent**, while eliminating conversion-impacting inconsistencies and closing accessibility gaps affecting roughly one in five users.

Get three specific commitments on the table:

1. **Approve the program** — greenlight the first two phases with allocated time and a public timeline
2. **Staff the manifest owner** — one dedicated headcount, not a rotation or part-time assignment
3. **Endorse code as source of truth** — formally commit that the existing codebase is the input to the rebuild, with a deprecation timeline for legacy systems

Without all three, the ADS program will stall. With them, it will ship.

---

## The Minimum Viable ADS

You do not need a complete manifest to start delivering value. The Minimum Viable ADS can ship within a single quarter:

- [ ] Three-layer token architecture with semantic roles for all color, typography, and spacing tokens
- [ ] Constraints written for at least the semantic color layer
- [ ] Contracts for your ten most-used components
- [ ] Protocols for your three highest-traffic product surfaces
- [ ] Manifest server with query and validate endpoints active
- [ ] CI integration for the validate endpoint on at least one consumer codebase
- [ ] Manifest owner role staffed

Build it. Ship it. Learn from it.

---

## Crawl, Walk, Run

**Crawl: Dipping your toes in.**
Building the foundation. Establishing the Signal layer, writing first Contracts, configuring the manifest server. The crawl phase produces *confidence*, not productivity.

*Success looks like:* shared vocabulary, at least one team running manifest validation in CI, the manifest owner role staffed.

**Walk: Building momentum.**
The manifest covers your highest-traffic surfaces. AI agents are querying the manifest before generating output. New product surfaces are onboarding to the ADS rather than building their own component library.

*Success looks like:* time-to-build for new surfaces is measurably faster. Accessibility regressions are declining. Engineers file manifest queries rather than browse documentation.

**Run: Scaling across the organization.**
ADS is the default way of building. New products are built ADS-first. Multiple product brands resolve from the same component foundation. AI agents generate on-brand, on-system output as a matter of course.

*Success looks like:* engineering time goes into new product capabilities, not rebuilding existing components. The manifest is the organization's most important design document, and everyone knows it.

Teams that try to run before they have built the habits of the walk phase tend to build manifests that are technically correct but semantically shallow. **Crawl deliberately. Walk with intention. Run when the system earns it.**

---

## Getting Your Environment Ready

ADS work happens in two environments: the design environment and the development environment. Every member of the team needs enough tooling literacy to participate.

**The command line.** Where you install tooling, run validation checks, query the manifest server, and interact with version control. The barrier is psychological more than technical.

**API keys.** Every AI tool, the manifest server, and design system APIs require API keys. Rules: never commit a key to version control, never share in a chat or document, rotate any key you suspect has been exposed.

**MCP servers.** Model Context Protocol servers give AI agents direct access to your manifest, Figma libraries, and component documentation. Configuring an MCP connection requires installing the server package, configuring your API key, and pointing your AI tooling at the correct endpoint. One-time setup that pays dividends in every subsequent agent interaction.

**Version control.** The manifest is a versioned artifact. Every change should go through the same workflow as code: branched, reviewed, and merged.

**The cross-disciplinary reality.** ADS practice is not only for engineers. Designers author Signals and Contracts. Product managers prioritize Intents. Researchers contribute user needs. Writers own content guidelines. The bar: every person whose work informs the manifest should be able to interact with the tools that build it.
