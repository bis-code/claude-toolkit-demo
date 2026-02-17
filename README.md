# Task Manager — Claude Toolkit Demo

A simple Go + React monorepo used to demonstrate [claude-toolkit](https://github.com/bis-code/claude-toolkit) auto-detection and configuration.

## Structure

```
apps/
  api/    — Go backend (Gin + GORM + SQLite)
  web/    — React + TypeScript frontend
turbo.json  — Turborepo config (enables monorepo detection)
```

## Run

```bash
# API
cd apps/api && go run .

# Web
cd apps/web && npm install && npm run dev
```

## What the toolkit detects

When you run `install.sh` on this project, it should detect:
- **Go** (from go.mod) → installs Go rules + go-backend-architect agent
- **React + TypeScript** (from package.json) → installs TypeScript rules + frontend agents
- **Docker** (from docker-compose.yml + Dockerfile) → installs Docker domain agent
- **Database** (from GORM import) → installs database domain agent
- **Monorepo structure** (from apps/ directory) → workspace-aware configuration
