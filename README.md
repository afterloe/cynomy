# cynomy
cynomy命令行工具
========

很多时候都在为了构建项目而烦恼，创建项目，复制文件，修改配置。开发的时候不断的commit／push代码，突然有一天忘记push了结果kpi被扣了，所以有了cynomy命令行工具辅助，可以大大的减少这些事情的发生

## 安装
```bash
$ npm install -g cynomy
```
如果网速过慢也可以使用如下命令
```
$ cnpm install -g cynomy
```
测试
```bash
$ cynomy

  Usage: cynomy [options] [command]


  Commands:

    help                显示使用帮助
    test [options]      测试项目中的所有测试用例
    push [options]      push 代码到对应的git仓库
    install [options]   安装cynomy系列软件
    c [options] <file>  创建python, javascript, markdown, css, binary, bash 文件

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

## 构建项目
项目是基于node进行构建的所以请确保项目有package.json
```bash
$ cynomy install
can't find package.json in /tmp, please run npm init first
```
所以是请优先构建package.json
```bash
$ npm init
$ ls
package.json
$ cynomy install
begin to structure project good luck...
mkdir test ... SUCCESS!
mkdir doc ... SUCCESS!
mkdir config ... SUCCESS!
create file .cynomy ... SUCCESS! 
create file Makefile ... SUCCESS! 
change file package.json ... SUCCESS! 
cp file to /tmp/test/.jshintrc ... SUCCESS! 
cp file to /tmp/test/.tern-project ... SUCCESS! 
create file INSTALL.md ... SUCCESS! 
create file History.md ... SUCCESS! 
project structure SUCCESS!
$ npm install
$ ls
History.md	Makefile	doc		test
INSTALL.md	config		package.json		node_modules
```

## 使用
利用cynomy命令行创建文件
====
cynomy 会扫描项目根目录下的.cynomy文件来构建项目，包括提示信息，所以编辑.cynomy文件即可客制化自己的文件模版。除了项目级别的，工具还会扫描user的家目录下的.cynomy文件，采用合并的方式进行配置，全局配置可以写在家目录下。  
.cynomy 支持的配置
```json
{
	"author": "项目／文件的作者信息，用于展示在文件头部标识是谁创建的文件",
	"licensed": "开源方案名可以参考github的",
	"version": "项目版本信息，用于展示在History中，标识版本",
	"mail": "邮件地址",
	"homePage": "个人主页"
}
```
```bash
$ cynomy c inde.js

/**
  * test - test/index.js
  *
  * Copyright(c) author.
  * ISC Licensed
  *
  * Authors:
  *  user  <mail> (homePage)
  * Date:
  *   2017-1-10 23:00:44
  */
"use strict";
```

测试命令
======
测试是使用mocha进行集成测试的，只测试test文件下的以_test.js结尾的文件。其他的文件是不进行测试的，所以请注意。
```bash
$ cynomy test
```

如果要测试单一的moca文件，请使用
```bash
$ cynomy test -s test/fileSystem_test.js
```

git集成命令
======
请确保项目是使用git进行的
```bash
$ cynomy push
fatal: Not a git repository (or any of the parent directories): .git
```

cynomy push 操作会自动将该分支下所有的修改文件添加进git缓存，然后commit本地分支，最后协助你push该分支到所有的远程服务器上。使用 -m 可以定义这次修改的内容，-r 可以定义只提交到该远程服务器名， -b 指定远程分支， -n 只提交本地分支，不推送到远程分支， -s 强制构建项目。  

构建项目采用的是make进行的，该功能在windows上会存在问题，请谨慎使用。构建的时候如果出现任何不符合规则的异常都会终止提交，只有构建成功之后在会推动代码提交。跟多的内容请期待开发。  

afterloe  
lm6289511@gmail.com
