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
};

const [jsNode] = [new Chain(createJSFile)];

module.exports = {
    content: (file, relativePath) => jsNode.passRequest(file, relativePath),
};
