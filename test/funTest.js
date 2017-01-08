/**
  * afterloe - cynomy/test/funTest.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
  * Date:
  *   2017-1-6 21:10:55
  */
"use strict";

const {spawn} = require("child_process");

const pushCommit = (remote, branch) => new Promise((solve, reject) => {
  // git push origin master
  if (!remote && !branch) {
    solve("done");
    return ;
  }
  const gitPush = spawn("git", ["push", remote, branch]);
  let buf = new Buffer(0);
  gitPush.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  gitPush.stderr.on("data", err => reject(new Error(err.toString())));
  gitPush.on("close", code => 0 === code ? solve(buf.toString()): reject(new Error(`git push ${remote} ${branch} is failed`)));
  gitPush.on("error", err => reject(err));
});

pushCommit("origin", "master").then(data => console.log(data)).catch(err => console.log(err));
