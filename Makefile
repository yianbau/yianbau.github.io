# HELP
# This will output the help for each task
# thanks to https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
all: help

.PHONY: all

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

initial: ## initial
	npm ci

themes: ## add theme
	git clone https://github.com/sharvaridesai/hexo-theme-edinburgh themes/edinburgh

check-env: ## validate Node/Hexo environment
	npm run check:env

snapshot-baseline: ## update playwright visual and dom baseline
	npm run snapshot:baseline

verify-ui: ## run playwright visual and dom regression checks
	npm run verify:ui

preview: ## preview
	npm run check:env
	npm run server

generate: ## generate
	npm ci
	npm run check:env
	npm run clean
	npm run build
	npm run verify:build

deploy: ## deploy
	npm ci
	npm run check:env
	npm run clean
	npm run build
	npm run verify:build
	npm run verify:ui
	npm run deploy
