YARN ?= $(shell which yarn)
NPM ?= $(shell which npm)
NPX ?= $(shell which npx)
AWS ?= $(shell which aws)

SRC_DIR ?= $(abspath src)
INFRA_DIR ?= $(abspath infra)
WEBSITE_DIR ?= $(SRC_DIR)/website

AWS_PROFILE ?= samuel

.PHONY: install-website
install-website:
	cd $(WEBSITE_DIR) && $(YARN) install --no-progress

.PHONY: build-website
build-website: install-website
	cd $(WEBSITE_DIR) && $(YARN) run build

.PHONY: infra-install
infra-install:
	cd $(INFRA_DIR) && $(NPM) install

.PHONY: infra-diff
.EXPORT_ALL_VARIABLES:
AWS_PROFILE = samuel
infra-diff: infra-install
	cd $(INFRA_DIR) && $(NPX) cdk diff

.PHONY: infra-deploy
.EXPORT_ALL_VARIABLES:
AWS_PROFILE = samuel
infra-deploy: build-website infra-install
	cd $(INFRA_DIR) && $(NPX) cdk deploy

.PHONY: aws-login
aws-login:
	$(AWS) sso login --profile $(AWS_PROFILE)

.PHONY: clean
clean:
	rm -rf $(INFRA_DIR)/node_modules
	rm -rf $(WEBSITE_DIR)/node_modules


