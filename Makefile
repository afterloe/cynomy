.PHONY: check,mocha-test

PATH := ./node_modules/.bin:$(PATH)
SHELL := /bin/bash
MOCHA_FILES := $(shell find ./test -name '*_test.js')

# 轮询指令
all: check mocha-test

# 测试指令
test: mocha-test test-cov clean

# 检测代码是否符合标准
check: bin/* lib/*.js config/index.js tools/*.js test/*_test.js
	@jshint $^

# cov 测试覆盖率
test-cov: $(MOCHA_FILES)
	@istanbul cover node_modules/.bin/_mocha $^ -R spec

# mocha测试
mocha-test: $(MOCHA_FILES)
	@mocha $^ --reporter mochawesome
