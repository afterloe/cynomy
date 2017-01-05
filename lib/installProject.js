/**
  * afterloe - cynomy/lib/installProject.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  * Date:
  *   2017-1-5 15:11:33
  */
"use strict";

const [{join, basename}, {existsSync, writeFile, readdirSync, readFileSync, createReadStream, createWriteStream}] = [require("path"), require("fs")];

let fileList;

const extendPkg = root => new Promise((resolve, reject) => {
    let pkg = require(join(root, "package"));
    Object.assign(pkg, {
      "devDependencies": {
        "istanbul": "^0.4.5",
        "jshint": "^2.9.4",
        "mocha": "^3.2.0"
      }
    });
    writeFile(join(root, "package.json"), JSON.stringify(pkg), err => {
        if (err) {
            console.log("change file package.json ... FAILED! ");
            reject(err);
        }
        console.log("change file package.json ... SUCCESS! ");
        resolve();
    });
});

const cp = (targrt, root) => new Promise((resolve, reject) => {
    const [sourceStream, targetStream] = [createReadStream(join(__dirname, "..", targrt)), createWriteStream(join(root, targrt))];
    sourceStream.pipe(targetStream);
    targetStream.on("error", err => {
        console.log(`create file ${targrt} ... FAILED! `);
        reject(err)
    });

    sourceStream.on("error", err => {
        console.log(`create file ${targrt} ... FAILED! `);
        reject(err)
    });

    sourceStream.on("close", () => {
        console.log(`create file ${targrt} ... SUCCESS! `);
        resolve();
    });
});

const createMakefile = root => new Promise((resolve, reject) => {
    const buf = `.PHONY: check,mocha-test

PATH := ./node_modules/.bin:$(PATH)
SHELL := /bin/bash
MOCHA_FILES := $(shell find ./test -name '*_test.js')

# 轮询指令
all: check mocha-test

# 检测代码是否符合标准
check: $(shell find ./ -name '*.js' ! -path './node_modules/*')
	@jshint $^

# mocha测试
mocha-test: $(MOCHA_FILES)
	@mocha $^ --reporter mochawesome

# 清除
clean: lib-cov
	@rm -rf test-cov

# 测试覆盖率
test-cov: $(MOCHA_FILES)
	@istanbul cover node_modules/.bin/_mocha $^ -R spec
`;
    writeFile(join(root, "Makefile"), buf, err => {
        if (err) {
            console.log("create file Makefile ... FAILED! ");
            reject(err);
        }

        console.log("create file Makefile ... SUCCESS! ");
        resolve();
    });
});

const createCynomy = root => new Promise((resolve, reject) => {
    const {author = process.env.LOGNAME, license = "", mail = "", homePage = ""} = require(join(root, "package"));
    const cynomyCfg = {author, licensed: license, mail, homePage, };
    writeFile(join(root, ".cynomy"), JSON.stringify(cynomyCfg), err => {
        if (err) {
            console.log("create file .cynomy ... FAILED! ");
            reject(err);
        }

        console.log("create file .cynomy ... SUCCESS! ");
        resolve();
    });
});

/**
 * 自动补全文件
 *
 * @return {[type]} [description]
 */
const autoComplateFile = root => {
  // 创建 .cynomy
  // 创建 Makefile
  // 拷贝 .jshintrc
  // 拷贝 .tern-project
  // 扩展 package.json
    const taskList = Promise.all([createCynomy(root), createMakefile(root), cp(".jshintrc", root), cp(".tern-project", root), extendPkg(root)]);
    taskList.then(() => {
        console.log("project structure SUCCESS!");
    }).catch(err => {
        console.log("project structure FAILED!");
        console.log(err.message);
    });
};

/**
 * 判读文件夹是否是基础环境
 *
 * @param  {String}  __path 脚本运行路径
 * @return {Boolean}        是否是基础环境
 */
const isBaseEvn = __path => {
    const files = readdirSync(__path);
    for (let i = 0; i < files.length; i++) {
        if ("package.json" === files[i]) {
            fileList = files;
            return false;
        }
    }

    return true;
};

module.exports = ({frame}) => {
    const runtimePath = process.env.PWD;
    if (isBaseEvn(runtimePath)) {
        console.log(`can't find package.json in ${runtimePath}, please run npm init first`);
        return ;
    }
    console.log("begin to structure project good luck...");
    autoComplateFile(runtimePath);
};
