/**
  * afterloe - cynomy/test/fileSystem_test.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
  * Date:
  *   2017-1-9 15:07:24
  */
"use strict";

const [{resolve}, {deepEqual, equal, throws}] = [require("path"), require("assert")];
const fileSystem = require(resolve(__dirname, "..", "tools", "fileSystem"));

describe("fileSystem", () => {

  describe("#findRoot", () => {
    let hookOne, hookTwo;

    before(() => {
      hookOne = `${Math.random()}.mocha`;
      hookTwo = `${Math.random()}.mocha`;
    });

    it("normal test one hooks files", () => {
      const dir = fileSystem.findRoot(__dirname, "fileSystem_test.js");
      deepEqual(__dirname, dir);
    });

    it("normal test two hooks files", () => {
      const dir = fileSystem.findRoot(__dirname, ".git", ".cynomy");
      deepEqual(resolve(__dirname, ".."), dir);
    });

    it("normal test with two identical hooks files", () => {
      const dir = fileSystem.findRoot(__dirname, "fileSystem_test.js", "fileSystem_test.js");
      deepEqual(__dirname, dir);
    });

    it("normal test with two identical hooks files", () => {
      const dir = fileSystem.findRoot(__dirname, ".git", ".cynomy", ".git");
      deepEqual(resolve(__dirname, ".."), dir);
    });

    it("normal test not exists hooks files", () => {
      const dir = fileSystem.findRoot(__dirname, hookOne, hookTwo);
      equal(undefined, dir);
    });

    it("without hooks paramse", () => {
      const dir = fileSystem.findRoot(__dirname);
      deepEqual(__dirname, dir);
    });

    it("with wrong first params", () => {
      throws(() => {
        const dir = fileSystem.findRoot(hookOne);
        console.log(dir);
      }, /no such file or directory, scandir/);
    });

    it("with wrong params", () => {
      throws(() => {
        const dir = fileSystem.findRoot(hookOne, hookTwo);
        console.log(dir);
      }, /no such file or directory, scandir/);
    });

    it("without any paramse", () => {
      throws(() => {
        const dir = fileSystem.findRoot();
        console.log(dir);
      }, /Path must be a string. Received undefined/);
    });

    after(() => {
      hookOne = null;
      hookTwo = null;
    });
  });
});
