---
title: "The ADS Methodology"
description: "Signals, Intents, Contracts, Protocols, Experiences"
order: 3
---
Every good methodology starts with a metaphor.

Atomic Design looked at the natural world and found chemistry. ADS looks at how modern networked systems communicate. A device on a network does not browse a library of possible responses and pick one that looks right. It sends a signal. The signal carries intent. The receiver interprets the intent against a contract. The contract is governed by a protocol. The result is an experience.

That is the model for ADS. Not chemistry, but communication. Not assembly, but resolution. Not a library, but a protocol.

---

## What ADS Is

ADS is a methodology for building design systems designed from the ground up to be consumed by both humans and AI agents. It defines:
- **Five levels of abstraction**
- **Seven non-negotiable rules**
- **One core artifact: the manifest**

Unlike Atomic Design, ADS is built on a fundamentally different premise: the system is a protocol that agents query, not a reference that humans consult. **The component library is not the product. The manifest is the product.**

---

## The Five Levels

```
ATOMIC DESIGN          AGENTIC DESIGN SYSTEMS
─────────────          ──────────────────────
Atoms           →      Signals
Molecules       →      Intents
Organisms       →      Contracts
Templates       →      Protocols
Pages           →      Experiences
```

---

### Level 1: Signals *(were: Atoms)*

In ADS, Signals are the smallest meaningful design decisions in the system. Not HTML elements — design decisions. The choice of a color, a spacing value, a type scale, a radius. But with three required properties that atoms do not have:

1. **A semantic name** that encodes meaning, not appearance. Not `blue-500` but `color.action.primary`.
2. **A resolved value** that is platform and theme-aware.
3. **A constraint** that defines where the Signal is valid and where it is not.

This third property — the constraint — is what separates ADS from a token system. **Token systems store values. Signals store meaning.**

```yaml
signal:
  name: color.action.primary
  value: "{color.blue.600}"
  semantic_role: primary-interactive-element
  valid_in: [button, link, tab, toggle]
  invalid_in: [text-body, background, decorative]
  constraint: requires-interactive-handler
  platforms: [web, ios, android, figma]
```

---

### Level 2: Intents *(were: Molecules)*

An Intent is defined not by its composition but by its **purpose**. It answers: what is the user or system trying to accomplish?

A molecule tells you what something is made of. An Intent tells you what something is for. And it is purpose, not composition, that AI agents need to reason about correctly.

Consider the "primary action" Intent. On desktop web it might resolve to a large button in the top-right corner of a card. On mobile, a full-width button pinned to the bottom. On email, a deep link. The composition differs wildly. **The Intent is the same across all of them.**

```yaml
intent:
  name: primary-action
  description: The main action available to a user in a given context
  resolves_to: [Button(variant=primary), Link(role=cta)]
  constraints:
    - one-per-view-section
    - requires-explicit-label
    - not-valid-in: disabled-container
  valid_contexts: [card, form, modal, page-header]
```

---

### Level 3: Contracts *(were: Organisms)*

A Contract is defined by its **rules** — the machine-readable specification governing a component: what it can do, what it cannot do, what it requires, and what it promises.

The critical difference: an organism documents structure, a Contract enforces rules. **Violating an organism is invisible. Violating a Contract fails the build.**

```yaml
contract:
  name: Button
  intent: [primary-action, secondary-action, destructive-action]
  variants: [primary, secondary, ghost, destructive]
  required_props:
    - label: string (max 32 chars)
    - onClick: function
  constraints:
    - label must be human-readable
    - destructive variant requires confirmation pattern in parent
    - primary variant: max one per view section
  forbidden:
    - do not nest buttons
    - do not use as navigation (use Link contract)
```

---

### Level 4: Protocols *(were: Templates)*

A Protocol is a machine-readable configuration that defines how Intents resolve for a specific surface, platform, and theme. It does not show a layout — it defines **resolution rules**.

```yaml
protocol:
  name: product-card-mobile
  surface: product-card
  platform: mobile-web
  theme: brand-a
  intent_resolutions:
    primary-action:
      resolves_to: Button
      variant: primary
      position: bottom
    headline:
      resolves_to: Text
      style: type.heading.3
      max_chars: 60
  constraints:
    - max 2 actions per card
    - headline required
```

---

### Level 5: Experiences *(were: Pages)*

An Experience is a **validated output**. By the time an interface reaches the Experience level, it has already been validated at every previous level. The critical difference from Atomic Design's pages:

- In Atomic Design, validation is a human activity performed at the **end** of the process.
- In ADS, validation is an automated activity performed **continuously**, at every merge.

An Experience is done when the manifest confirms it is valid — not when a human decides it looks right.

---

## The Seven Rules

The five levels define the structure of an ADS. The seven rules define the behavior. These are not guidelines. They are the conditions that make a system agentic rather than merely well-documented.

---

**Rule 1: No hardcoded values at any level.**

Every value must trace back to a named Signal. Hardcoded values are dead ends for agents.

---

**Rule 2: Every level must be machine-queryable.**

Every element at every ADS level must be queryable via the manifest API. If something lives only in documentation, it does not exist in an ADS.

---

**Rule 3: Composition is intent resolution, not assembly.**

Agents do not assemble. They query. Humans design the resolution rules. The manifest executes them.

---

**Rule 4: Constraints are executable, not documented.**

"Do not use more than one primary button per section" must be an executable function in the manifest, not a guideline in a style guide. The constraint is enforced at build time, every time, for every consumer.

---

**Rule 5: The manifest is the product.**

The component library is a downstream artifact of the manifest. If the manifest and the component library disagree, the manifest is right.

---

**Rule 6: Agents are first-class consumers.**

Every naming convention, every structural choice, every API design must account for an agent consuming it programmatically alongside a human consuming it visually.

---

**Rule 7: Versioning is structural, not optional.**

Every Signal, Intent, Contract, and Protocol carries a version reference. Every change generates a diff. Every breaking change generates a migration guide automatically.
