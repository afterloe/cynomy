/**
  * afterloe - cynomy/test/makeTest.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
  * Date:
  *   2017-1-9 11:14:29
  */
"use strict";

const spawn = require("child_process").spawn;
const resolve = require("path").resolve;
const ROOT = resolve(__dirname, "..");

const structureProject = () => new Promise((solve, reject) => {
  const make = spawn("make", [], {
    cwd: ROOT
  });

  let buf = new Buffer(0);
  make.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  make.on("error", err => reject(err));
  make.on("close", code => {
    if (0 !== code) {
      reject(buf.toString());
      console.log("make is Failed.");
      return ;
    }
    solve();
  });
});

structureProject().then(data => console.log(data)).catch(err => console.log(err));
