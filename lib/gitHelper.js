/**
  * afterloe - cynomy/lib/gitHelper.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
  * Date:
  *   2017-1-6 15:13:54
  */
"use strict";

const [{resolve}, {spawn}, {existsSync, readdirSync}] = [require("path"), require("child_process"), require("fs")];
const [ROOT, FILES, typeMapping] = [Symbol("ROOT"), Symbol("FILES"), new Map()];

typeMapping.set("new files", "??");
typeMapping.set("modify files", "M");
typeMapping.set("delete files", "D");

const findRoot = __path => {
  const parentPath = resolve(__path, "..");
  if (!existsSync(parentPath)) {
      return;
  }
  const files = readdirSync(__path);
  for (let i = 0; i < files.length; i++) {
      if ("package.json" === files[i]) {
          module[FILES] = files;
          return __path;
      }
  }

  return findRoot(parentPath);
};

const addFiles = () => new Promise((solve, reject) => {
  // git add --a
  const gitAddAll = spawn("git", ["add", "--a"]);
  let buf = new Buffer(0);
  gitAddAll.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  gitAddAll.stderr.on("data", err => reject(new Error(err.toString())));
  gitAddAll.on("error", err => reject(err));
  gitAddAll.on("close", code => 0 === code ? solve(buf.toString()): reject(new Error("git add --a Failed")));
});

const commitChange = message => new Promise((solve, reject) => {
  // git commit -m "message"
  const gitCommit = spawn("git", ["commit" ,`-m ${message}`]);
  let buf = new Buffer(0);
  gitCommit.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  gitCommit.stderr.on("data", err => reject(new Error(err.toString())));
  gitCommit.on("error", err => reject(err));
  gitCommit.on("close", code => 0 === code ? solve(buf.toString()): reject(new Error("git add --a Failed")));
});

const getRemote = () => new Promise((solve, reject) => {
  // git remote -v | grep push | awk '{print $1}'
  const [gitRemote, grep, awk] = [spawn("git", ["remote", "-v"]), spawn("grep", ["push"]), spawn("awk", ["{print $1}"])];
  let buf = new Buffer(0);

  gitRemote.stdout.on("data", chunk => grep.stdin.write(chunk));
  gitRemote.stderr.on("data", chunk => reject(new Error(chunk.toString())));
  gitRemote.on("error", err => reject(err));
  gitRemote.on("close", code => 0 === code ? grep.stdin.end(): reject(new Error("git remote -v maybe generatro an error")));

  grep.stdout.on("data", chunk => awk.stdin.write(chunk));
  grep.stderr.on("data", chunk => reject(new Error(chunk.toString())));
  grep.on("error", err => reject(err));
  grep.on("close", code => 0 === code? awk.stdin.end(): reject(new Error("grep push is not data here")));

  awk.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  awk.stderr.on('data', err => reject(new Error(err.toString())));
  awk.on("error", err => reject(err));
  awk.on("close", code => 0 === code ? solve(buf.toString()): reject(new Error(`git remote -v | grep push | awk '{print $1}' is failed`)));
});

const getBranchInfo = () => new Promise((solve, reject) => {
  // git branch -q | grep '*' | awk '{print $2}'
  const [gitBranch, grep, awk] = [spawn("git", ["branch", "-q"]), spawn("grep", ["*"]), spawn("awk", ["{print $2}"])];
  let buf = new Buffer(0);

  gitBranch.stdout.on("data", chunk => grep.stdin.write(chunk));
  gitBranch.stderr.on("data", chunk => reject(new Error(chunk.toString())));
  gitBranch.on("error", err => reject(err));
  gitBranch.on("close", code => 0 === code ? grep.stdin.end(): reject(new Error("git branch -q maybe generatro an error")));

  grep.stdout.on("data", chunk => awk.stdin.write(chunk));
  grep.stderr.on("data", chunk => reject(new Error(chunk.toString())));
  grep.on("error", err => reject(err));
  grep.on("close", code => 0 === code? awk.stdin.end(): reject(new Error("grep '*' is not data here")));

  awk.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  awk.stderr.on('data', err => reject(new Error(err.toString())));
  awk.on("error", err => reject(err));
  awk.on("close", code => 0 === code ? solve(buf.toString()): reject(new Error(`git branch -q | grep '*' | awk '{print $2}' is failed`)));
});

const gitStatus = type => new Promise((solve, reject) => {
  // git status -s | grep ?? | awk '{print $2}'
  const command = typeMapping.get(type);
  if (! command) {
    console.log(`can't find any command about ${type}`);
    return;
  }
  const [status, grep, awk] = [spawn("git", ["status", "-s"]), spawn("grep", [command]), spawn("awk", ["{print $2}"])];
  let buf = new Buffer(0);

  status.stdout.on("data", chunk => grep.stdin.write(chunk));
  status.stderr.on('data', err => reject(new Error(err.toString())));
  status.on("close", code => 0 === code ? grep.stdin.end(): reject(new Error("git status maybe generatro an error!")));
  status.on("error", err => reject(err));

  grep.stdout.on("data", chunk => awk.stdin.write(chunk));
  grep.stderr.on('data', err => reject(new Error(err.toString())));
  grep.on("close", () => awk.stdin.end());
  grep.on("error", err => reject(err));

  awk.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  awk.stderr.on('data', err => reject(new Error(err.toString())));
  awk.on("error", err => reject(err));
  awk.on("close", code => 0 === code ? solve(buf.toString()): reject(new Error(`find ${type} in git Failed.`)));
});

const recordHistory = () => {
  
};

const statusList = () => {
  // git status about new,modify,delete
  const list = Promise.all([gitStatus("new files"), gitStatus("modify files"), gitStatus("delete files")]);
  list.then(data => {
    console.log(data);
  }).catch(err => {
    console.log(err);
  });
};

module.exports = ({message, branch, remote}) => {
  module[ROOT] = findRoot(process.env.PWD);
  if (!module[ROOT]) {
    console.log("Can't find project root! please sure this is cynomy project! or you can run cynomy install to create a cynomy project");
    return ;
  }

  statusList();
  // commitChange(message);
};
