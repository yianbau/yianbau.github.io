# HELP
# This will output the help for each task
# thanks to https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
all: help

.PHONY: all

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

initial:
	sudo npm install -g hexo-cli
	npm install

priview:
	hexo server

generate:
	hexo clean && hexo g

deploy:
	hexo clean && hexo deploy
