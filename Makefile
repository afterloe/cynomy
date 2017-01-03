.PHONY: check,mocha-test

PATH := ./node_modules/.bin:$(PATH)
SHELL := /bin/bash
MOCHA_FILES := $(shell find ./test -name '*_test.js')

# 检测代码是否符合标准
check: bin/* lib/*.js config/index.js
	@jshint $^	
