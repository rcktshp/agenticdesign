---
title: "Agentic Design"
description: "Designers in the Age of Agents"
order: 9
---
Every major shift in how interfaces are built has changed what it means to be a designer. The web. Mobile. And now: AI agents.

Like every shift before it, this one is not replacing designers. It is changing what designers do, what they are responsible for, and where their highest-value contribution lies.

---

## What Agents Actually Do

To understand what the agentic shift means for designers, it is useful to be precise.

**Agents generate.** Given a prompt, a context, and access to a design system, an agent can produce UI output: component trees, layout structures, content arrangements, interaction specifications. Quickly, at scale, with formal correctness that exceeds what a human can maintain manually across hundreds of screens.

**What agents do not do is decide.** An agent generating UI from a manifest is implementing decisions that humans have already made. The Signal layer encodes decisions about what colors mean and where they belong. The Intent layer encodes decisions about what patterns are for. The Contract layer encodes rules governing component behavior.

The agent executes those decisions. It does not make them.

**The work of making decisions about what a design system means is not only still human work in an ADS. It is more human work than it has ever been** — because those decisions are now the primary output of design systems practice, not a byproduct of component craftsmanship.

---

## The Blanding Problem Agents Create (and How Designers Are the Fix)

When AI agents build products without a semantic design system to reason against, they produce competent, correct, generic output. Not because the agents are bad — because they are drawing on the patterns that appear most frequently across training data.

Right now, across every product category, hundreds of teams are using AI agents to build new products and features. Most are pointing their agents at design systems built to be read by humans, not reasoned about by machines. The agents do their best. Their best is the competent middle of the internet.

The designers who understand this problem, and understand how to solve it, are the most valuable designers in the industry right now. They know the answer is not less AI — it is **a better protocol layer**. A semantic design system that gives agents something to reason against that is specific, intentional, and brand-encoded.

Building that protocol layer is the highest-value design work available today.

---

## The Designer's New Primary Output

In a traditional design system, a designer's primary output is **components** — Figma frames, annotated specifications, visual design decisions expressed in files that engineers implement.

In an Agentic Design System, a designer's primary output is the **semantic layer** — Signals, Intents, constraint rules, Protocol definitions. Design decisions expressed as machine-readable schemas that the system executes automatically across every surface.

This is a more powerful role. It is also a more abstract one.

When you design a button, you can see it. When you design the constraint that says a primary button must never appear without an associated action handler, the connection between the work and the output is mediated. You write the constraint. The manifest encodes it. The CI pipeline enforces it. An agent building a new screen three months from now produces a correct button because of the decision you made today.

**Learning to find satisfaction in that mediated relationship — in designing the rules rather than the artifacts — is one of the most important shifts a designer makes in the agentic era.** It is a shift from craftsperson to architect. From making things to defining how things are made.

---

## The Skills That Matter More

The agentic shift does not make classic designer skills obsolete. It joins them with new skills that most design education does not currently teach.

**Systems thinking at the semantic level.** The ability to think not just about how a component looks but about what it means, where it belongs, and what rules govern its use.

**Constraint design.** The ability to write rules that are neither so strict they block legitimate needs nor so loose they fail to prevent genuine violations. Designing good constraints is a skill that takes practice.

**Semantic naming.** The ability to name design decisions in a way that communicates their purpose to both humans and machines. `color.action.primary` is better than `blue-600` not because it is longer but because it carries meaning.

**System auditing.** The ability to look at AI-generated output across a large surface area and assess systemic correctness — not "does this button look right?" but "does this system of components correctly express the Intents it was built to satisfy?"

**Manifest authoring.** Translating design decisions into machine-readable schemas: YAML, JSON, typed schema formats. These are design skills, applied in a new medium.

---

## What Agents Get Wrong (And Why Designers Are Irreplaceable)

AI agents are very good at formal correctness. What they are not good at is detecting **semantic drift** — the slow accumulation of small decisions that each seem correct in isolation but collectively move the system away from its intended character.

Example: a manifest includes an `informational-callout` Intent designed to be present but not prominent. Over months, agents use it correctly in every individual instance. But because the product is adding more contextual information, the callout starts appearing five or six times on a single screen. Each instance is formally valid. The aggregate is a screen that feels anxious and crowded.

No constraint in the manifest catches this. A human designer auditing the screen sees it immediately.

When a designer identifies this kind of drift, the corrective action is not to fix individual screens manually. It is to update the manifest — add a constraint limiting informational callouts per screen section. **The fix happens at the system level and propagates to every future output automatically.**

This is the agentic design loop: agents produce output → human designers audit for systemic quality → designers encode corrections as manifest updates → agents produce better output. The human is in the loop not as a reviewer of individual outputs but as the **sensor for systemic quality that individual constraints cannot capture**.

---

## Designers as Protocol Architects

A protocol architect does not build every building in the city. They design the building code: the rules governing how buildings are constructed, what materials are permitted, how egress must be provided. The protocol architect's work is invisible in any individual building. It is visible in the character of the city as a whole.

In an ADS, the manifest is the building code. The designer's work is visible not in any individual screen but in the consistency and quality that those protocols produce across a surface area no one person could cover manually.

For designers who find this shift disorienting: **the move from artifact to protocol is not a loss of creative authority. It is an expansion of it.** A designer who authors the Signals and Intents and Contracts of an ADS has more influence over the final product experience than a designer who spends their days crafting individual components.

---

## The Design Organization in the Agentic Era

The design system team's role expands significantly in the agentic era. The manifest is the most important design artifact in the organization. The people who own it have more influence over the consistency, quality, and brand expression of every product than any individual product designer.

This means design system teams need to be funded and staffed at a level commensurate with that influence. The manifest owner role needs to be senior. The team authoring Contracts and Protocols needs to include designers with deep product experience.

Design education has not caught up to this reality yet. Most design programs still teach tools and visual craft. Very few teach constraint design, semantic naming, or manifest authoring. **This is an opportunity:** the designers who build these skills now are positioned to lead the discipline for the next decade.

---

## The Human in the Loop

The human in the loop is not a temporary placeholder until the machines get good enough. **The human is a structural necessity.**

Not because machines cannot generate formally correct output — they can. But because formal correctness is not the same as experiential quality, and experiential quality requires human judgment that cannot be fully encoded in any finite set of constraints.

The manifest is a model of the design system. All models are incomplete. All models accumulate gaps as the world they model evolves. The human designer's role is to continuously improve the model: to identify where it is incomplete, to encode what it is missing, to audit the output it produces for the systemic quality that transcends what any individual constraint can capture.

---

## The Horizon: From Fixed to Fluid

Everything described in this book operates within a familiar frame: interfaces designed in advance, built to a specification, delivered in a form that is essentially settled.

But there is a further horizon: **generative UI**.

Not interfaces that rearrange their layout, but interfaces that reconstitute themselves — generating different component structures, different information hierarchies, different interaction patterns for different users in different contexts. Early versions are running in production today.

Generative UI without a semantic design system produces generative blanding. If an AI system generates interface structures on the fly with no protocol layer to reason against, it falls back on statistical patterns. Every "personalized" experience is personalized at the content level but identical at the structural and aesthetic level.

Generative UI that is genuinely differentiated **requires the ADS protocol layer**. The manifest provides the constraints within which generation is valid. Within those constraints, generation is free to be genuinely adaptive. Outside them, it produces output that violates brand, accessibility standards, or the interaction model.

Building ADS infrastructure today is not just about improving the consistency of interfaces you are shipping now. **It is about being ready for a mode of interface delivery that is arriving faster than most organizations have acknowledged.**

The designers who build fluency with ADS now are the designers who will build the systems that make this kind of experience possible. The future is not fixed. The design systems infrastructure for navigating it is being built right now.
