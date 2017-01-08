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

const [{resolve}, {spawn}, {existsSync, readdirSync, appendFile}, co] = [require("path"), require("child_process"), require("fs"), require("co")];
const [createFile, {strToKeyValue, getFormateTime}, {get}] = [require(resolve(__dirname, "createFile")), require(resolve(__dirname, "..", "tools", "currency")),
  require(resolve(__dirname, "..", "config"))];
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

const getGitUserInfo = () => new Promise((solve, reject) => {
  // git config --list | grep user
  const [gitConfig, grep] = [spawn("git", ["config", "--list"]), spawn("grep", ["user"])];
  let buf = new Buffer(0);
  gitConfig.stdout.on("data", chunk => grep.stdin.write(chunk));
  gitConfig.stderr.on('data', err => reject(new Error(err.toString())));
  gitConfig.on("close", code => 0 === code ? grep.stdin.end(): reject(new Error("git config maybe generator an error!")));
  gitConfig.on("error", err => reject(err));

  grep.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  grep.stderr.on('data', err => reject(new Error(err.toString())));
  grep.on("error", err => reject(err));
  grep.on("close", code => 0 === code ? solve(buf.toString()): reject(new Error(`git config --list | grep user is failed`)));
});

const generatorFilesList = (title, files) => {
  if (0 === files.length) {
    return new Buffer(0);
  }
  let buf = new Buffer(`### ${title}`);
  for (let i = 0; i < files.length; i++) {
    const content = files[i];
    if ("" === content) {
      continue;
    }
    let __buf = new Buffer(`\n> ${content}  `);
    buf = Buffer.concat([buf, __buf], buf.length + __buf.length);
  }

  return buf;
};

const generatorChangList = fileList => {
  const [modifyFileContent, newFileContent, deleteFileContent] = [generatorFilesList("new files", fileList.get("new files")),
    generatorFilesList("modify files", fileList.get("modify files")), generatorFilesList("delete files", fileList.get("delete files"))];
  let buf = new Buffer(0);
  buf = Buffer.concat([modifyFileContent, newFileContent, deleteFileContent], modifyFileContent.length + newFileContent.length + deleteFileContent.length);
  return buf.toString();
};

const generatorHistoryMsg = (message, fileList) => new Promise((solve, reject) => {
  const promise = Promise.all([getGitUserInfo(), getBranchInfo()]);
  promise.then(baseInfo => {
    const [userInfoStr, branchInfo] = baseInfo;
    const userInfo = strToKeyValue(userInfoStr);
    solve(`
${get("version")} / ${getFormateTime()}
==================
commit by ${userInfo["user.name"]}(${userInfo["user.email"]})
  * ${branchInfo}:${message}

${generatorChangList(fileList)}
`);
  }).catch(err => reject(err));
});

const recordHistory = message => {
  // file, data[, options], callback
  const historyFile = resolve(module[ROOT], "History.md");
  if (!existsSync(historyFile)) {
    createFile(historyFile, {});
    return recordHistory();
  }

  return new Promise((solve, reject) => {
    appendFile(historyFile, message, err => {
      if (err) {
        reject(err);
        return ;
      }

      solve();
    });
  });
};

const getChangFiles = () => new Promise((solve, reject) => {
  const list = Promise.all([gitStatus("new files"), gitStatus("modify files"), gitStatus("delete files")]);
  list.then(data => {
    const [newFiles, modifyFiles, deleteFiles] = data;
    if (newFiles.length === modifyFiles.length && newFiles.length === deleteFiles.length) {
      if (0 === newFiles.length) {
        reject(new Error("no files to commit !"));
        return ;
      }
    }
    const filesList = new Map();
    filesList.set("new files", newFiles);
    filesList.set("modify files", modifyFiles);
    filesList.set("delete files", deleteFiles);
    solve(filesList);
  }).catch(err => reject(err));
});

const pushChange = (remote, branch) => new Promise((solve, reject) => {
  // git push origin master
  if (remote && branch) {
    console.log(`git push ${remote} ${branch}`);
    solve();
  } else {
    const pushInfo = Promise.all([getRemote(), getBranchInfo()]);
    pushInfo.then(data => {
      const [remoteStr, __branch] = data;
      const remotes = remoteStr.split("\n");
      for (let i = 0; i < remotes.length; i++) {
        console.log(`git push ${remotes[i]} ${__branch}`);
      }
      solve();
    }).catch(err => reject(err));
  }
});

module.exports = ({message, branch, remote}) => {
  module[ROOT] = findRoot(process.env.PWD);
  if (!module[ROOT]) {
    console.log("Can't find project root! please sure this is cynomy project! or you can run cynomy install to create a cynomy project");
    return ;
  }

  if (!message) {
    message = `${new Date().toLocaleString()} commit change.`;
  }

  co(function* () {
    // 显示所有修改或要处理的文件列表
    const fileList = yield getChangFiles();
    // 写入history.md文件记录历史
    const log = yield generatorHistoryMsg(message, fileList);
    yield recordHistory(log);
    // git add --a
    yield addFiles();
    // git commit -m
    yield commitChange(message);
    // git push 功能
    return yield pushChange(remote, branch);
  }).then(() => {
    console.log(`${getFormateTime()} push change success!`);
  }).catch(err => {
    console.log(err.message);
    console.log("push change failed! use git push by you own or try again.");
  });
};
