/**
  * afterloe - cynomy/test/mock/fileSystem_test.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
  * Date:
  *   2017-1-10 10:00:58
  */
"use strict";

const [{resolve}, muk, {throws}] = [require("path"), require("muk"), require("assert")];
const fileSystem = require(resolve(__dirname, "..", "..", "tools", "fileSystem"));

describe("mock test for fileSystem", () => {

  describe("#findRoot tmock test", () => {
    before(() => {
      // readdirSync, readFileSync, createReadStream, createWriteStream
      muk(fileSystem, "findRoot", () => {
        throw new Error("muk Error");
      });
    });

    it("normal test one hooks files", () => {
      throws(() => {
        const dir = fileSystem.findRoot(__dirname, "fileSystem_test.js");
        console.log(dir);
      }, /muk Error/);
    });

    after(() => {
      muk.restore();
    });
  });
});
