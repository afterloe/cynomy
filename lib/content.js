/**
  * afterloe - cynomy/lib/content.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
  * Date:
  *   2017-1-4 13:37:57
  */
"use strict";

const {resolve, extname} = require("path");
const [{get}, Chain] = [require(resolve(__dirname, "..", "config")), require(resolve(__dirname, "chain"))];

function createPyhtonFile(file, relativePath) {
    if(".py" === extname(file)) {
      return `/**
* ${get("author")} - ${relativePath}
*
* Copyright(c) ${get("author")}.
* ${get("licensed")} Licensed
*
* Authors:
*   ${get("author")} <${get("mail")}> (${get("homePage")})
* Date:
*   ${new Date().toLocaleString()}
*/`;
    } else {
      return Chain.next();
    }
}

/**
 * 创建bash文件模版
 *
 * @param  {[String]} file         [文件名]
 * @param  {[String]} relativePath [相对路径]
 * @return {[String]}              [模版内容]
 */
function createBashFile(file, relativePath) {
    if(".sh" === extname(file)) {
      return `#! /bin/bash

#--------------------------------------------
# ${get("author")} - ${relativePath}
#
# Authors: ${get("author")} <${get("mail")}> (${get("homePage")})
# ${get("licensed")} Licensed
# Date: ${new Date().toLocaleString()}
#--------------------------------------------
`;
    } else {
      return Chain.next();
    }
}

/**
 * 创建css文件模版
 *
 * @param  {[String]} file         [文件名]
 * @param  {[String]} relativePath [相对路径]
 * @return {[String]}              [模版内容]
 */
function createCssFile(file, relativePath) {
    if (".css" === extname(file)) {
        return `/**
  * ${get("author")} - ${relativePath}
  *
  * Copyright(c) ${get("author")}.
  * ${get("licensed")} Licensed
  *
  * Authors:
  *   ${get("author")} <${get("mail")}> (${get("homePage")})
  * Date:
  *   ${new Date().toLocaleString()}
  */
`;
    } else {
        return Chain.next();
    }
}

/**
 * 创建html文件模版
 *
 * @param  {[String]} file         [文件名]
 * @param  {[String]} relativePath [相对路径]
 * @return {[String]}              [模版内容]
 */
function createHTMLFile(file, relativePath) {
    if(".html" === extname(file)) {
        return `<!--
  create by ${get("author")}, ${get("licensed")} Licensed

  ${relativePath}
  Copyright(c) ${get("author")}. ${new Date().toLocaleString()}
  Authors: ${get("author")} <${get("mail")}> (${get("homePage")})
-->
<html>
  <head>
    <meta charset="utf8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1,user-scalable=no" />
    <meta name="renderer" content="webkit|ie-comp|ie-stand" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <title></title>
  </head>
  <body>
  </body>
</html>`;
    } else {
        return Chain.next();
    }
}

/**
 * 创建js文件模版
 *
 * @param  {[String]} file         [文件名]
 * @param  {[String]} relativePath [相对路径]
 * @return {[String]}              [模版内容]
 */
function createJSFile(file, relativePath) {
    if (".js" === extname(file)) {
        return `/**
  * ${get("author")} - ${relativePath}
  *
  * Copyright(c) ${get("author")}.
  * ${get("licensed")} Licensed
  *
  * Authors:
  *   ${get("author")} <${get("mail")}> (${get("homePage")})
  * Date:
  *   ${new Date().toLocaleString()}
  */
"use strict";`;
    } else {
        return Chain.next();
    }
}

/**
 *  创建可执行python 二进制文件
 *
 * @param  {[String]} relativePath [相对路径]
 * @param  {[String]} type         [二进制文件类型]
 * @return {[String]}              [文件内容]
 */
function createBinaryPythonFile(relativePath, type) {
    if ("py" === type) {
        return `#!/usr/bin/env python
${createPyhtonFile("binary.py", relativePath)}`;
    } else {
      return Chain.next();
    }
}

/**
 *  创建可执行bash 二进制文件
 *
 * @param  {[String]} relativePath [相对路径]
 * @param  {[String]} type         [二进制文件类型]
 * @return {[String]}              [文件内容]
 */
function createBinaryBashFile(relativePath, type) {
    if ("bash" === type) {
        return createBashFile("binary.sh", relativePath);
    } else {
      return Chain.next();
    }
}

/**
 *  创建可执行js 二进制文件
 *
 * @param  {[String]} relativePath [相对路径]
 * @param  {[String]} type         [二进制文件类型]
 * @return {[String]}              [文件内容]
 */
function createBinaryJSFile(relativePath, type) {
    if ("js" === type) {
      return `#!/usr/bin/env node
${createJSFile("binary.js", relativePath)}`;
    } else {
      return Chain.next();
    }
}

// 申明二进制执行文件的职责链
const [binaryJSNode, binaryBashNode, binaryPythonNode] = [new Chain(createBinaryJSFile),
  new Chain(createBinaryBashFile), new Chain(createBinaryPythonFile)];
// 设置二进制执行文件职责链
binaryJSNode.setNext(binaryBashNode).setNext(binaryPythonNode);

/**
 * 创建无类型的Binary可执行文件
 *
 * @param  {[type]} file         [description]
 * @param  {[type]} relativePath [description]
 * @param  {[type]} type         [description]
 * @return {[type]}              [description]
 */
function createBinaryFile(file, relativePath, type) {
    if (!type) {
      console.log("lack options type maybe type={js|py|bash}");
      return ;
    }
    return binaryJSNode.passRequest(relativePath, type);
}

// 申明文件内容职责链
const [jsNode, htmlNode, cssNode, bashNode, binaryNode] = [new Chain(createJSFile),
  new Chain(createHTMLFile), new Chain(createCssFile), new Chain(createBashFile),
  new Chain(createBinaryFile)];

// 设置文件内容职责链
jsNode.setNext(htmlNode).setNext(cssNode).setNext(bashNode).setNext(binaryNode);

module.exports = {
    content: (file, relativePath, {type}) => jsNode.passRequest(file, relativePath, type),
};
