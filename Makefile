.PHONY: help install dev build lint typecheck test format clean up down logs \
        api.api api.test api.shell web.web web.test web.lint web.build

# ---- Defaults --------------------------------------------------------------
SHELL := /bin/sh
COMPOSE_FILE := infra/docker/docker-compose.yml

help: ## Show this help
	@grep -E '^[a-zA-Z_.-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ---- Setup -----------------------------------------------------------------
install: ## Install all deps (Node + Python)
	pnpm install
	cd apps/api && uv sync || pip install -r requirements.txt

# ---- Quality ---------------------------------------------------------------
lint: ## Lint every package
	pnpm lint

typecheck: ## Type-check every package
	pnpm typecheck

test: ## Run every package's tests
	pnpm test

format: ## Format every file
	pnpm format

clean: ## Remove build artifacts
	pnpm clean

# ---- Docker infra ----------------------------------------------------------
up: ## Start Postgres + Redis
	docker compose -f $(COMPOSE_FILE) up -d

down: ## Stop infra
	docker compose -f $(COMPOSE_FILE) down

logs: ## Tail infra logs
	docker compose -f $(COMPOSE_FILE) logs -f

# ---- API -------------------------------------------------------------------
api.dev: ## Run API locally
	cd apps/api && uv run fastapi dev src/main.py --port 8000

api.test: ## Run API tests
	cd apps/api && uv run pytest

api.shell: ## Open a shell in the API venv
	cd apps/api && uv run bash

# ---- Web -------------------------------------------------------------------
web.dev: ## Run web locally
	pnpm --filter web dev

web.build: ## Build web for production
	pnpm --filter web build

web.lint: ## Lint web only
	pnpm --filter web lint

web.test: ## Test web only
	pnpm --filter web test
