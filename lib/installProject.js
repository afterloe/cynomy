/**
  * afterloe - cynomy/lib/installProject.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
  * Date:
  *   2017-1-5 15:11:33
  */
"use strict";

const [{join, resolve}, {writeFile, readdirSync, createReadStream, createWriteStream}] = [require("path"), require("fs")];
const [createFile, {structureDir, setRoot}] = [require(resolve(__dirname, "createFile")), require(resolve(__dirname, "structureDir"))];

let fileList;

/**
 * 扩展package.json
 *
 * @param  {String} root  项目根路径
 * @return {Promise}
 */
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

/**
 * 复制文件
 *
 * @param  {String} targrt  复制的目标
 * @param  {String} root    项目根路径
 * @return {Promise}
 */
const cp = (targrt, root) => new Promise((resolve, reject) => {
    const [sourceStream, targetStream] = [createReadStream(join(__dirname, "..", targrt)), createWriteStream(join(root, targrt))];
    sourceStream.pipe(targetStream);
    targetStream.on("error", err => {
        console.log(`create file ${targrt} ... FAILED! `);
        reject(err);
    });

    sourceStream.on("error", err => {
        console.log(`create file ${targrt} ... FAILED! `);
        reject(err);
    });

    sourceStream.on("close", () => {
        console.log(`create file ${targrt} ... SUCCESS! `);
        resolve();
    });
});

/**
 * 创建Makefile文件
 *
 * @param  {String} root  项目根路径
 * @return {Promise}
 */
const createMakefile = root => new Promise((resolve, reject) => {
    const buf = `.PHONY: check,mocha-test

PATH := ./node_modules/.bin:$(PATH)
SHELL := /bin/bash
MOCHA_FILES := $(shell find ./test -name '*_test.js')

# 轮询指令
all: check mocha-test

# 检测代码是否符合标准
check: $(shell find . -name '*.js' ! -path './node_modules/*')
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

/**
 * 创建cynomy配置文件
 *
 * @param  {String} root  项目根路径
 * @return {Promise}
 */
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
 * 构建二级目录 文件
 *
 * @return {null}
 */
const structureSecoundFload = () => {
    createFile("INSTALL.md", {});
    console.log("create file INSTALL.md ... SUCCESS! ");
    createFile("History.md", {});
    console.log("create file History.md ... SUCCESS! ");
};

/**
 * 遍历查询一级目录文件
 *
 * @param  {String} file 文件名
 * @return {Boolean}      是否存在于一级目录中
 */
function findFile(file) {
    for (let i = 0; i< fileList.length; i++) {
        if (file === fileList[i]) {
            return true;
        }
    }

    return false;
}

/**
 * 检查该目录是否被构建过
 *
 * @return {Boolean}   是否被构建
 */
const checkBaseEvn = () => {
    if (!fileList.length) {
        console.log("insufficient privilege ... FAILED");
        return false;
    }
    const [cynomyFlag, makefileFlag, installFlag, historyFlag, jshintrcFlag, ternFlag] = [findFile(".cynomy"), findFile("Makefile"), findFile("INSTALL.md"),
      findFile("History.md"), findFile(".jshintrc"), findFile(".tern-project")];

    return cynomyFlag && makefileFlag && installFlag && historyFlag && jshintrcFlag && ternFlag ;
};

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
  // 构建 test文件夹
  // 构建 doc文件夹
  // 构建 test文件夹
    setRoot(root);
    const taskList = Promise.all([createCynomy(root), createMakefile(root), cp(".jshintrc", root),
      cp(".tern-project", root), extendPkg(root), structureDir("test"), structureDir("doc"), structureDir("config")]);
    taskList.then(() => {
        structureSecoundFload();
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
	if (frame) {
		console.log(`${frame} is not supper!`);
		return ;
	}
  if (isBaseEvn(runtimePath)) {
      console.log(`can't find package.json in ${runtimePath}, please run npm init first`);
      return ;
  }

  if (checkBaseEvn()) {
      console.log(`${runtimePath} has already structure, you can use cynomy install -y to compulsory construction`);
      return;
  }
  console.log("begin to structure project good luck...");
  autoComplateFile(runtimePath);
};
