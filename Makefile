
SHELL = /bin/bash
.SHELLFLAGS = -o pipefail -c

.PHONY: help
help: ## Print info about all commands
	@echo "Helper Commands:"
	@echo
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[01;32m%-20s\033[0m %s\n", $$1, $$2}'
	@echo
	@echo "NOTE: dependencies between commands are not automatic. Eg, you must run 'deps' and 'build' first, and after any changes"

.PHONY: build
build: ## Compile all modules
	pnpm build

.PHONY: test
test: ## Run all tests
	pnpm test

.PHONY: lint
lint: ## Run style checks and verify syntax
	pnpm verify

.PHONY: format
format: ## Run syntax re-formatting
	pnpm format

.PHONY: deps
deps: ## Installs dependent libs using 'pnpm install'
	pnpm install --frozen-lockfile

.PHONY: setup
setup: ## Use NVM to install and activate node+pnpm
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash > /dev/null
	bash -l -c 'nvm install && nvm use && npm install --global pnpm'

.PHONY: clean
clean: ## Clean up all build, dependencies and temporary artifacts
	pnpm clean
	pnpm clean:deps
