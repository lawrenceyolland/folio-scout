# Project Scout

**project-scout** gives junior frontend developers senior-level feedback on their projects before they add them to their portfolio.

> ⚠️ **Work in progress** - actively under development, not production ready.

## How it works

A repo URL is submitted via a Hono API route. The repo is cloned and a Java static analyser inspects the project, producing a weighted signal report - things like exposed environment files (and credentials...), missing or conflicting lockfiles, absent config files, and structural red flags that would raise eyebrows in a code review. That report is passed to Claude which generates a senior-level review with feedback and recommendations.

## Stack

- **Astro / React** - frontend (TODO)
- **Hono** - API layer
- **Java** - static analysis
- **simple-git** - repo cloning
- **Claude** - LLM feedback layer (TODO)

## Current status

- [x] Repo cloning
- [x] Root structure analysis
- [x] package.json analysis
- [ ] Framework / Metaframework analysis
- [ ] Environment file analysis
- [ ] Signal weighting
- [ ] Claude feedback layer
- [ ] Astro / React frontend
