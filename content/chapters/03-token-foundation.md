---
title: "The Token Foundation"
description: "Why Tokens Alone Are Not Enough"
order: 4
---
Design tokens have been the design systems industry's favorite answer for several years. The move from hardcoded hex values to named, referenceable design decisions was a genuine leap forward.

But tokens, as most teams implement them, are not enough for an Agentic Design System.

A token, as currently defined by most teams and tooling, is a named value: `blue-600: #1A56DB`. Named. Referenceable. Propagatable. What a named value does not carry is **meaning**. It does not tell an AI agent anything about the semantic role of any value in the context of your design system.

**An AI agent looking at a token file sees a spreadsheet. It can read every row. It cannot reason about any of them.**

---

## The Three-Layer Architecture

The foundation of an ADS token system is a three-layer architecture. Collapsing the layers or skipping one creates exactly the kind of structural ambiguity that makes AI agents unreliable.

---

### Layer 1: Primitive Tokens

Primitive tokens are the raw values of your design system. They are not decisions. They are **options** — the full palette of what is possible.

```
color.blue.100:  #EFF6FF
color.blue.500:  #3B82F6
color.blue.600:  #1A56DB
color.blue.700:  #1E40AF

spacing.1:   4px
spacing.4:   16px
spacing.8:   32px

radius.sm:    4px
radius.md:    8px
radius.full:  9999px
```

**Primitive tokens are never used directly in components.** They exist solely to be referenced by the layers above them. If a developer reaches for `color.blue.600` directly in component code, the system has been short-circuited.

An agent that references primitive tokens directly will produce technically correct output that is semantically meaningless — a color that happens to be right, not a color that is right for this purpose.

---

### Layer 2: Semantic Tokens

Semantic tokens are where design decisions are made. They map a design purpose to a primitive value, transforming a collection of values into a design language.

```
# Color decisions
color.action.primary:         {color.blue.600}
color.action.primary.hover:   {color.blue.700}
color.text.primary:           {color.gray.900}
color.text.secondary:         {color.gray.600}
color.text.on-action:         {color.white}
color.background.surface:     {color.white}
color.status.error:           {color.red.600}
color.status.success:         {color.green.600}
color.border.focus:           {color.blue.600}

# Spacing decisions
spacing.component.padding.sm:  {spacing.2}
spacing.component.padding.md:  {spacing.4}
spacing.layout.gutter:         {spacing.6}

# Typography decisions
type.heading.1:  {font.family.display} / {font.size.5xl} / {font.weight.bold}
type.body.default: {font.family.sans} / {font.size.md} / {font.weight.regular}
```

`color.action.primary` tells an agent not just what color to use, but what it is for. `color.text.on-action` tells an agent this color belongs on top of action-colored backgrounds. These are semantic relationships — the difference between a token system and a design language.

---

### Layer 3: Component Tokens

Component tokens scope the semantic decisions to a particular component, creating a local namespace that makes component-level overrides clean and explicit.

```
# Button component tokens
button.background:              {color.action.primary}
button.background.hover:        {color.action.primary.hover}
button.label.color:             {color.text.on-action}
button.label.style:             {type.label.md}
button.padding.horizontal:      {spacing.component.padding.md}
button.corner-radius:           {radius.md}
button.border.focus:            {color.border.focus}

# Input component tokens
input.background:               {color.background.surface}
input.border.default:           {color.border.default}
input.border.focus:             {color.border.focus}
input.border.error:             {color.status.error}
```

When an agent generates a Button component, it does not need to decide what color the background should be. It queries the manifest, receives `button.background: color.action.primary`, and applies that value. **The decision has already been made.**

---

## The Token Coverage Imperative

In an ADS, incomplete token coverage is a critical failure. An AI agent encountering an uncovered property either ignores it entirely or hallucinates a value based on training data patterns. Neither outcome is acceptable.

**Every ADS must have complete token coverage across these categories:**

| Category | What to include | Why AI agents need it |
|---|---|---|
| Color | Action, text, background, border, status, overlay | Most queried property; highest hallucination risk |
| Typography | Family, size scale, weight, line-height, tracking | Hierarchy decisions require semantic roles |
| Spacing | Component padding, layout gutter, inline gap, section | Agents confuse component and layout spacing |
| Radius | Per-component class, contextual rules | Without constraints, agents apply pill radius everywhere |
| Motion | Duration, easing, delay, reduced-motion alternatives | Agents hardcode values or omit motion entirely |
| Elevation | Shadow levels, z-index scale | Layering decisions require explicit rules |
| Iconography | Size scale, weight, style constraints per context | Agents choose wrong icon sizes without a scale |
| Grid | Columns, gutters, margins per breakpoint | Layout generation requires explicit grid rules |

Every gap in your token coverage is a design decision that currently lives in someone's head, not in the system. Tokenizing it makes it auditable, enforceable, and shareable.

---

## Theme Agnosticism

When Signals are properly separated into three layers and components only reference semantic tokens, it becomes possible to **swap the entire brand appearance of a product by swapping a single theme file**.

```yaml
# Theme: Brand A
theme:
  name: brand-a
  tokens:
    color.action.primary:       color.blue.600
    color.action.primary.hover: color.blue.700
    radius.button:              radius.md

# Theme: Brand B
theme:
  name: brand-b
  tokens:
    color.action.primary:       color.gray.900
    color.action.primary.hover: color.gray.800
    radius.button:              radius.full   # pill buttons for Brand B
```

Same component code. Same Contracts. Same Intents. Same Protocols. Only the theme file changes.

This is the mechanism by which a single Agentic Design System can serve multiple products, multiple brands, and multiple surfaces simultaneously. And for AI agents, theme agnosticism means the agent's output is always on-brand without the agent having to know what the brand is — the manifest resolves the theme.

---

## The Standardization Imperative

For an organization's design systems to be interoperable, **the semantic layer of token naming must be standardized across all systems**. Primitive values can differ per brand. Component implementations can differ per platform. But semantic names must align.

When semantic token names are standardized, a component built for one system can be adopted by another simply by providing a different theme. The cross-system redundancy that drives the costs described in Chapter 1 becomes solvable.

The standardization conversation is the gateway to the ecosystem. Do not skip it.

---

## From Token System to Signal Layer

The three-layer token architecture is the foundation of the Signal layer in an ADS. But to become true Signals, tokens need one more property that most token systems do not carry: **constraints**.

A semantic token tells you what a value is for. A Signal tells you what a value is for, and where it is valid, and where it is not, and what rules govern its use.

Adding constraints transforms a design decision into a design contract. And design contracts are what make the system queryable, enforceable, and trustworthy for AI agents.

---

## Documentation as the Connective Tissue

In a human-only design system, documentation served human readers who could interpolate and use judgment. AI agents cannot interpolate. They cannot ask a colleague. They execute what they are given.

Signal constraints and Contract rules are documentation written at the precision level that machines require. That precision level turns out to be more useful for humans too. A constraint that says "`color.action.primary` is valid in interactive elements and invalid in decorative elements" is more useful to a junior designer than a doc page that says "use our primary blue for actions."

The shift: from **documentation as afterthought** to **documentation as infrastructure**. Every hour spent sharpening a constraint saves every consumer of that constraint from having to figure it out themselves, every time, forever.
