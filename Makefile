# HELP
# This will output the help for each task
# thanks to https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
all: help

.PHONY: all

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

initial: ## initial
	npm install -g hexo-cli@4.2.0
	npm install
	git clone https://github.com/sharvaridesai/hexo-theme-edinburgh themes/edinburgh

preview: ## preview
	hexo server

generate: ## generate
	hexo clean && hexo g

deploy: ## deploy
	hexo clean && hexo deploy
