/**
  * afterloe - cynomy/test/createFile_test.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
  * Date:
  *   2017-1-4 09:57:30
  */
"use strict";

const [{resolve}, {notEqual , ifError, equal, deepStrictEqual}, {unlinkSync}] = [require("path"), require("assert"), require("fs")];
const createFile = require(resolve(__dirname, "..", "lib", "createFile"));

/**
 * lib/createFile 功能测试
 *
 */
describe("createFile", () => {

  /**
   * 正常功能测试
   */
  describe("nomal create a js file", () => {
    const timeStamp = new Date().getTime();
    const [js, markdown, html, css, bash] = [`${timeStamp}.js`, `${timeStamp}.md`, `${timeStamp}.html`, `${timeStamp}.css`, `${timeStamp}`];

    it("create js without options", done => {
      
    });

    /**
     * 回收测试环境
     *
     * @type {Function}
     */
    after(() => {
      unlinkSync(js);
      unlinkSync(markdown);
      unlinkSync(html);
      unlinkSync(css);
      unlinkSync(bash);
    });
  });
});
