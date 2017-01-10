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

const [{resolve, basename}, {notDeepEqual, deepEqual, equal, throws}, {existsSync, unlinkSync}] = [require("path"), require("assert"), require("fs")];
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

  describe("#findUserIndividualization", () => {
    let dirA, dirB;

    before(() => {
      dirA = resolve(__dirname, "..");
      dirB = Math.random() + "/mocha";
    });

    it("read normal configuration", () => {
      const configuration = fileSystem.findUserIndividualization(dirA);
      notDeepEqual({}, configuration);
    });

    it("read configuration with a not exists dir", () => {
      throws(() => {
        const configuration = fileSystem.findUserIndividualization(dirB);
        deepEqual({}, configuration);
      }, /configuration file is not fount in this project or you home/);
    });

    it("read configuration without any params", () => {
      throws(() => {
        const configuration = fileSystem.findUserIndividualization();
        deepEqual({}, configuration);
      }, /configuration file is not fount in this project or you home/);
    });

    after(() => {
      dirA = undefined;
      dirB = undefined;
    });
  });

  describe("#cp", () => {
    let fileA, fileB, dirA, dirB;

    before(() => {
      fileA = resolve(__dirname, "..", ".cynomy");
      fileB = `${Math.random()}.mocha`;
      dirA = __dirname;
      dirB = resolve(Math.random() + "", Math.random() + "", Math.random() + "");
    });

    it("cp an an existing file to this", done => {
      const [source, target] = [fileA, dirA];
      fileSystem.cp(source, target).then(() => {
        const dir = fileSystem.findRoot(dirA, basename(fileA));
        deepEqual(__dirname, dir);
        done();
      }).catch(err => done(err));
    });

    it("cp an existing file to an unknown location", done => {
      const [source, target] = [fileA, dirB];
      fileSystem.cp(source, target).then(() => {
        done(new Error("can't go here! "));
      }).catch(() => done());
    });

    it("cp an unknow file to an existing folder", done => {
      const [source, target] = [fileB, dirA];
      fileSystem.cp(source, target).then(() => {
        done(new Error("can't go here! "));
      }).catch(() => done());
    });

    it("cp an unknow file to an unknown location", done => {
      const [source, target] = [fileB, dirB];
      fileSystem.cp(source, target).then(() => {
        done(new Error("can't go here! "));
      }).catch(() => done());
    });

    after(done => {
      const [cpCynomyFile, cpCynomyFilesB] = [resolve(dirA, ".cynomy"), resolve(dirA, fileB)];

      if (existsSync(cpCynomyFile)) {
        unlinkSync(cpCynomyFile);
      }

      if (existsSync(cpCynomyFilesB)) {
        unlinkSync(cpCynomyFilesB);
      }

      done();
    });
  });
});
