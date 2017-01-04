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

const [jsNode, htmlNode, cssNode, bashNode] = [new Chain(createJSFile), new Chain(createHTMLFile), new Chain(createCssFile), new Chain(createBashFile)];

jsNode.setNext(htmlNode);
htmlNode.setNext(cssNode);
cssNode.setNext(bashNode);

module.exports = {
    content: (file, relativePath) => jsNode.passRequest(file, relativePath),
};
