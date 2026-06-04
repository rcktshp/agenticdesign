---
title: "The Manifest"
description: "The Heart of an Agentic System"
order: 5
---
Every design system needs a center of gravity. In Atomic Design, that center is the component library. In an Agentic Design System, it is the **manifest**.

Not the component library. Not the Figma file. Not the documentation site. The manifest.

---

## What the Manifest Is

The manifest is a single, versioned, machine-readable schema that encodes the complete **semantic knowledge** of the design system — not the visual knowledge, not the documentation, but what every Signal means, what every Intent resolves to, what every Contract permits and forbids, and what every Protocol specifies for every surface.

More precisely, the manifest encodes:

- Every Signal with its semantic role, resolved value, valid contexts, and constraint rules
- Every Intent with its resolution logic, valid surfaces, and contextual overrides
- Every Contract with its required props, optional props, constraint functions, and platform implementations
- Every Protocol with its surface-specific resolution maps and theme bindings
- The version history and structured diff log for all of the above
- The dependency graph between all elements

The manifest is not a documentation format. It is an executable schema. Every constraint in it is a function, not a paragraph. Every resolution rule is a lookup, not a guideline. Every version change is a structured diff, not a changelog entry.

---

## What the Manifest Is Not

**Not a token file.** A token file stores values. The manifest stores semantics. A token file is an *input* to the manifest.

**Not a style guide.** A style guide is documentation for humans. The manifest is an API for machines.

**Not a component library.** The component library is a *downstream artifact* of the manifest, generated from it and validated against it.

**Not Figma.** Figma is also a downstream artifact. The Figma variables library is generated from the manifest's Signal layer. If the manifest and Figma disagree, the manifest is right.

---

## The Manifest Server

The manifest is not a static file. It is a served, versioned API. A complete manifest server exposes five endpoints:

---

### `GET /manifest/:version`
Returns the complete manifest for a given version. Used by AI agents that need to understand the entire system before generating output, and by documentation generators and design tooling.

---

### `POST /query`
The primary interface for AI agents in real-time design workflows. An agent submits an intent and context. The manifest returns the constrained, theme-resolved set of components, tokens, and constraints that satisfy that intent.

```json
// Request
{
  "intent": "primary-action",
  "context": {
    "surface": "product-card",
    "platform": "mobile-web",
    "theme": "brand-a",
    "parent": "card"
  }
}

// Response
{
  "component": "Button",
  "variant": "primary",
  "tokens": {
    "background":  { "name": "button.background",  "value": "#1A56DB" },
    "label":       { "name": "button.label.color",  "value": "#FFFFFF" },
    "radius":      { "name": "button.corner-radius","value": "8px"    },
    "padding-h":   { "name": "button.padding.horizontal", "value": "16px" }
  },
  "constraints": [
    "max-one-per-view-section",
    "requires-click-handler",
    "label-max-32-chars"
  ],
  "manifest_version": "4.1.0"
}
```

---

### `POST /validate`
Accepts a component tree and returns a list of constraint violations. Used by CI/CD pipelines to validate committed code and by AI coding assistants to self-check their output. Every violation includes the rule violated, the element that violated it, and the corrective action required.

---

### `GET /diff/:v1/:v2`
Returns a structured diff between two manifest versions — a machine-readable list of every Signal, Intent, Contract, and Protocol that changed, with each change classified as additive, breaking, or deprecated.

---

### `GET /manifest/:version/:surface`
Returns a theme-resolved manifest for a specific surface and version, used by platform codegen pipelines.

---

## The Manifest in Practice: How Agents Use It

Imagine an agent building a product card for a mobile web surface with a blue brand. Here is the complete workflow:

**Step 1: Query the Protocol.**
The agent queries by surface and platform to receive the resolution map — which Intents are present on a product card and how each one resolves.

**Step 2: Resolve each Intent.**
For each Intent, the agent queries `/query` with the intent and context. The manifest returns the component, variant, and token set. No design decisions required from the agent.

**Step 3: Generate the output.**
The agent generates the component tree using only values returned by the manifest. No invented values. No judgment calls.

**Step 4: Validate.**
Before committing, the agent sends the component tree to `/validate`. If violations are returned, the agent corrects them and re-validates. The output is not committed until the manifest confirms it is valid.

**Step 5: Record.**
The committed output is logged against the manifest version it was generated from. If the manifest changes in a future version, the system knows which outputs may need to be regenerated.

This workflow produces on-system, on-brand output for every surface, every time, without a human reviewing each decision individually.

---

## The Context Cascade

In a traditional process, design decisions lose fidelity at every handoff. A designer makes a choice. It gets translated into a spec. An engineer reads the spec and implements it. By the time the component reaches production, information has been lost in translation at every stage.

In an ADS, the manifest changes this fundamentally. The designer's decision is encoded as a machine-readable rule to be executed — not a visual artifact to be interpreted. This is the **context cascade**: every stage of the process inherits the full context of all decisions made before it, rather than receiving a lossy translation of them.

The cascade produces quality that no amount of manual review can replicate at scale, because manual review is itself a re-interpretation. The cascade is not a review. It is an inheritance.

---

## The Manifest Owner

The manifest is only as trustworthy as the process that keeps it current. This is why the manifest owner role is not optional.

**The manifest owner is responsible for:**

- **The semantic layer** — every Signal's semantic role, constraint, and valid context list
- **Intent resolution logic** — authoring and reviewing changes to Protocols and Intents
- **Contract governance** — reviewing Contract changes for semantic correctness before they are merged
- **Weekly triage** — reviewing override rates, validation failure rates, and query patterns
- **The quarterly audit** — comparing the manifest against actual product output every quarter

**What the manifest owner is not:** a single point of bottleneck. They are not the only person who can propose changes. They are the person responsible for the manifest's semantic integrity. The difference is between gatekeeping and stewardship.

Staff the manifest owner before you launch. A manifest without an owner is a manifest that will drift. A drifted manifest produces wrong AI output.

---

## The Manifest Is Not Done

Like a design system, the manifest is never done. It is a living artifact.

The right approach: build a manifest that is correct for the surfaces it currently serves, launch it to its first consumers, and iterate based on what you learn. **A manifest with fifty Signals, ten Intents, and five Contracts that is actively used and continuously improved is more valuable than a manifest with five hundred Signals that sits in a repository waiting to be finished.**

Start with what you need. Ship it. Learn from it. Expand it.
