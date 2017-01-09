/**
  * afterloe - cynomy/tools/gitExtends.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
  * Date:
  *   2017-1-9 18:08:01
  */
"use strict";

const {spawn} = require("child_process");
const typeMapping = new Map();

typeMapping.set("new files", "??"); // 设置git 新建文件标识符
typeMapping.set("modify files", "M");// 设置git 修改文件标识符
typeMapping.set("delete files", "D");// 设置git 删除文件标识符

/**
 * git指令功能 git add --a
 */
const addFiles = () => new Promise((solve, reject) => {
  const gitAddAll = spawn("git", ["add", "--a"]);
  let buf = new Buffer(0);
  gitAddAll.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  gitAddAll.stderr.on("data", err => reject(new Error(err.toString())));
  gitAddAll.on("error", err => reject(err));
  gitAddAll.on("close", code => {
    if (0 !== code) {
      reject(new Error("git add --a Failed"));
      return ;
    }
    console.log("[SUCCESS] git add change files done.");
    solve(buf.toString());
  });
});

/**
 * git指令功能 git commit -m "message"
 *
 * @param  {String} message 提交修改的信息
 * @return {Promise}
 */
const commitChange = message => new Promise((solve, reject) => {
  const gitCommit = spawn("git", ["commit" ,`-m ${message}`]);
  let buf = new Buffer(0);
  gitCommit.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  gitCommit.stderr.on("data", err => reject(new Error(err.toString())));
  gitCommit.on("error", err => reject(err));
  gitCommit.on("close", code => {
    if (0 !== code) {
      reject(new Error("git add --a Failed"));
      return ;
    }
    console.log("[SUCCESS] git commit done.");
    solve(buf.toString());
  });
});

/**
 * git功能集 获取git远端提交信息
 *
 * @return {Promise}
 */
const getRemote = () => new Promise((solve, reject) => {
  // git remote -v | grep push | awk '{print $1}'
  const [gitRemote, grep, awk] = [spawn("git", ["remote", "-v"]), spawn("grep", ["push"]), spawn("awk", ["{print $1}"])];
  let buf = new Buffer(0);

  gitRemote.stdout.on("data", chunk => grep.stdin.write(chunk));
  gitRemote.stderr.on("data", chunk => reject(new Error(chunk.toString())));
  gitRemote.on("error", err => reject(err));
  gitRemote.on("close", code => 0 === code ? grep.stdin.end(): reject(new Error("git remote -v maybe generator an error")));

  grep.stdout.on("data", chunk => awk.stdin.write(chunk));
  grep.stderr.on("data", chunk => reject(new Error(chunk.toString())));
  grep.on("error", err => reject(err));
  grep.on("close", code => 0 === code? awk.stdin.end(): reject(new Error("grep push is not data here")));

  awk.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  awk.stderr.on('data', err => reject(new Error(err.toString())));
  awk.on("error", err => reject(err));
  awk.on("close", code => 0 === code ? solve(buf.toString()): reject(new Error(`git remote -v | grep push | awk '{print $1}' is failed`)));
});

/**
 * git功能集 获取当前分支的分支信息
 *
 * @return {Promise}
 */
const getBranchInfo = () => new Promise((solve, reject) => {
  // git branch -q | grep '*' | awk '{print $2}'
  const [gitBranch, grep, awk] = [spawn("git", ["branch", "-q"]), spawn("grep", ["*"]), spawn("awk", ["{print $2}"])];
  let buf = new Buffer(0);

  gitBranch.stdout.on("data", chunk => grep.stdin.write(chunk));
  gitBranch.stderr.on("data", chunk => reject(new Error(chunk.toString())));
  gitBranch.on("error", err => reject(err));
  gitBranch.on("close", code => 0 === code ? grep.stdin.end(): reject(new Error("git branch -q maybe generator an error")));

  grep.stdout.on("data", chunk => awk.stdin.write(chunk));
  grep.stderr.on("data", chunk => reject(new Error(chunk.toString())));
  grep.on("error", err => reject(err));
  grep.on("close", code => 0 === code? awk.stdin.end(): reject(new Error("grep '*' is not data here")));

  awk.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  awk.stderr.on('data', err => reject(new Error(err.toString())));
  awk.on("error", err => reject(err));
  awk.on("close", code => {
    if (0 !== code) {
      reject(new Error(`git branch -q | grep '*' | awk '{print $2}' is failed`));
      return;
    }

    solve(buf.toString().replace("\n", ""));
  });
});


/**
 * git功能集 获取不同状态的文件列表
 *
 * @param  {String} type 文件状态
 * @return {Promise}
 */
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
  status.on("close", code => 0 === code ? grep.stdin.end(): reject(new Error("git status maybe generator an error!")));
  status.on("error", err => reject(err));

  grep.stdout.on("data", chunk => awk.stdin.write(chunk));
  grep.stderr.on('data', err => reject(new Error(err.toString())));
  grep.on("close", () => awk.stdin.end());
  grep.on("error", err => reject(err));

  awk.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  awk.stderr.on('data', err => reject(new Error(err.toString())));
  awk.on("error", err => reject(err));
  awk.on("close", code => {
    if (0 !== code) {
      reject(new Error(`git status -s | grep ${type} | awk '{print $2}' is failed`));
      return ;
    }
    solve(buf.length === 0 ? []: buf.toString().split("\n"));
  });
});

/**
 * git功能集 获取git用户信息
 *
 * @return {Promise}
 */
const getGitUserInfo = () => new Promise((solve, reject) => {
  // git config --list | grep user
  const [gitConfig, grep] = [spawn("git", ["config", "--list"]), spawn("grep", ["user"])];
  let buf = new Buffer(0);
  gitConfig.stdout.on("data", chunk => grep.stdin.write(chunk));
  gitConfig.stderr.on("data", err => reject(new Error(err.toString())));
  gitConfig.on("close", code => 0 === code ? grep.stdin.end(): reject(new Error("git config maybe generator an error!")));
  gitConfig.on("error", err => reject(err));

  grep.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  grep.stderr.on("data", err => reject(new Error(err.toString())));
  grep.on("error", err => reject(err));
  grep.on("close", code => 0 === code ? solve(buf.toString()): reject(new Error(`git config --list | grep user is failed`)));
});


/**
 * git指令集 git push origin master
 *
 * @param  {String} remote 远程地址代理名
 * @param  {String} branch 提交分支名
 * @return {Promise}
 */
const pushCommit = (remote, branch) => new Promise((solve, reject) => {
  if (!remote || !branch) {
    solve("done");
    return ;
  }
  console.log(`try to push ${branch} to ${remote} ...`);
  const gitPush = spawn("git", ["push", remote, branch]);
  let buf = new Buffer(0);
  gitPush.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  gitPush.on("error", err => reject(err));
  gitPush.on("close", code => {
    if (0 !== code) {
      reject(new Error(`git push ${remote} ${branch} is failed`));
      return ;
    }
    console.log(`[SUCCESS] push ${branch} to ${remote} done.`);
    solve(buf.toString());
  });
});


/**
 * 提交变更到远程服务器
 *
 * @param  {String} remote 远程地址代理名
 * @param  {String} branch 提交分支名
 * @return {Promise}
 */
const pushChange = (remote, branch) => new Promise((solve, reject) => {
  // git push origin master
  if (remote && branch) {
    console.log(`git push ${remote} ${branch}`);
    solve();
  } else {
    const pushInfo = Promise.all([getRemote(), getBranchInfo()]);
    pushInfo.then(data => {
      const [remoteStr, __branch] = data;
      const [remotes, promiseList] = [remoteStr.split("\n"), []];
      for (let i = 0; i < remotes.length; i++) {
        const __remote = remotes[i];
        if ("" === __remote) {
          continue;
        }
        promiseList.push(pushCommit(__remote, __branch));
      }
      Promise.all(promiseList).then(data => {
        for (let i = 0; i < data.length; i++) {
          console.log(data[i]);
        }
        console.log("[SUCCESS] all remotes push complete done.");
        solve();
      }).catch(err => reject(err));
    }).catch(err => reject(err));
  }
});

module.exports = {
  addFiles,
  commitChange,
  getRemote,
  getBranchInfo,
  gitStatus,
  getGitUserInfo,
  pushCommit,
  pushChange
};
