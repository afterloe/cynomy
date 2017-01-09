/**
  * afterloe - cynomy/lib/mochaHelper.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
  * Date:
  *   2017-1-9 14:45:20
  */
"use strict";

const [{resolve}, {spawn}, {existsSync, readdirSync, statSync}] = [require("path"), require("child_process"), require("fs")];
const {findRoot} = require(resolve(__dirname, "..", "tools", "fileSystem"));
const [ROOT, mochaRegex, FILES] = [Symbol("ROOT"), /_test.js/, Symbol("FILES")];

const findMocahTestFiles = (__path = resolve(module[ROOT], "test")) => {
  const files = readdirSync(__path);
  for (let i = 0; i < files.length; i++) {
    const file = resolve(__path, files[i]);
    let state = statSync(file);
    if (state.isDirectory()) {
      return findMocahTestFiles(file);
    }

    if (mochaRegex.test(file)) {
      module[FILES].push(file);
      continue;
    }
  }
};

const mocha = () => new Promise((solve, reject) => {
  const command = resolve(module[ROOT], "node_modules", ".bin", "mocha");
  if (! existsSync(command)) {
    console.log("can't find mocha in this project");
    resolve();
    return ;
  }
  module[FILES] = [];
  findMocahTestFiles()
  const mocha = spawn(command, module[FILES], {
    cwd: module[ROOT],
    env: process.env
  });
  let buf = new Buffer(0);
  mocha.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  mocha.on("error", err => reject(err));
  mocha.stderr.on("data", err => reject(err.toString()));
  mocha.on("close", code => 0 === code ? solve(buf.toString()): reject("mocha ../test/fileSystem_test.js ../test/currency_test.js failed"));
});

module.exports = () => {
  const dir = findRoot(process.env.PWD, "node_modules", "package.json");
  module[ROOT] = dir;

  console.log("mocha test files ...");
  mocha().then(data => console.log(data)).catch(err => console.log(err));
};
