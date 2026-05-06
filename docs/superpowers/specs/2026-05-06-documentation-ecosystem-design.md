# Documentation Ecosystem — Huellas de Paz

**Date:** 2026-05-06
**Authors:** Tomás Pinolini, Franco Zancocchia (Ravenna)
**Status:** Approved

---

## Context

Huellas de Paz needed a clear answer to "where does this live?" across three tools. The goal is one purpose per tool, with explicit linking conventions that keep them connected without duplicating content. Modeled after the NeoVet setup (same dev team, proven in production).

---

## Tool Responsibilities

| Tool | Purpose | Lifetime |
|---|---|---|
| **Linear** | Operational work — tasks, bugs, versions, initiatives | Ephemeral (closes when done) |
| **Obsidian vault** | Permanent knowledge — decisions, domain, people, architecture | Never expires |
| **GitHub `docs/`** | Code-adjacent docs — setup, schema, changelog, specs | Lives with the code |

---

## Linear Structure

- **Team:** `HuellasdePaz`
- **Projects:** `CRM`, `Landing`, `Cotizador` — add `Chatbot` when Fase 4 starts
- **Milestones:** per project, map to phases from CLAUDE.md (`v1a`, `v1b`, `v2-portal`, etc.)
- **Statuses:** `Backlog → Todo → In Progress → In Review → Done` + `Canceled` + `Duplicate`

### Labels

| Category | Labels |
|---|---|
| Type | `bug`, `feature`, `improvement`, `chore` |
| Initiative | `init/cobranzas`, `init/portal-cliente`, `init/b2b` |
| Cross-cutting | `blocked-client`, `cross-app`, `security` |

- No cycles — milestones are sufficient for a 2-person team
- **Rule:** every issue with non-obvious context includes `**Vault:** wiki/features/X.md §section` in its description

---

## Obsidian Vault Structure

```
wiki/
  features/     — one note per feature: why it was built, business rules, edge cases
  architecture/ — ADRs, system diagrams, data model decisions
  domain/       — business knowledge: service types, plan coverage, cremation workflow
  people/       — stakeholder profiles: Huellas contacts, roles, communication preferences
  meetings/     — dated meeting notes: decisions, action items, open questions
  gaps/         — open questions pending resolution (close into ADR or Linear issue when resolved)
  audits/       — security reviews, code audits
  runbooks/     — operational guides: deploy, migrations, incident recovery
```

**Rules:**
- Decision made → `wiki/architecture/` (ADR format using `docs/standards/adr-template.md`)
- Has an expiry date → Linear, not the vault

---

## GitHub `docs/` Structure

```
README.md                          — project overview, stack, links to vault + Linear
docs/
  setup.md                         — local dev setup, env vars reference, migration guide
  schema.md                        — DB schema diagram (Mermaid)
  changelog/
    crm.md                         — CRM version history with Linear milestone refs
    landing.md                     — Landing version history
  standards/                       — ADR template, coding conventions (already exists)
  superpowers/specs/               — design specs from brainstorming sessions
```

**What does NOT go here:** meeting notes, stakeholder info, architecture decisions, feature wikis → all vault.

---

## The Bridge (linking convention)

```
Linear issue  →  "**Vault:** wiki/features/planes.md §cobertura-diferida"
Vault ADR     →  "Implemented in HDP-42, PR #87"
README.md     →  links to Linear project URL + vault repo URL
```

This is the single habit that makes the ecosystem coherent: Linear holds the *what/when/who*, the vault holds the *why/context*.
