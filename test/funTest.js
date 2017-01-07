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

// 显示所有要处理的文件
// git remote -v | grep push | awk '{print $1}' 查询所有提交地址
// git branch -v | grep '*' | awk '{print $2}'  查询分支
// git push origin master                       提交到远程操作
// git commit -m "msg"                          提交修改
const remote = spawn("git", ["remote", "-v"]);

remote.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

remote.stderr.on("data", (data) => {
  console.log(`stderr: ${data}`);
});

remote.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});
