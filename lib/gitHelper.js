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

typeMapping.set("new files", "??"); // 设置git 新建文件标识符
typeMapping.set("modify files", "M");// 设置git 修改文件标识符
typeMapping.set("delete files", "D");// 设置git 删除文件标识符

/**
 * 查询项目根目录
 *
 * @param  {String} __path 文件目录
 * @return {String}        项目根目录
 */
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
 * 生成文件列表
 *
 * @param  {String} title 列表标题
 * @param  {Array} files 该列表下的文件数组
 * @return {Buffer}       列表内容
 */
const generatorFilesList = (title, files) => {
  if (0 === files.length) {
    return new Buffer(0);
  }
  let buf = new Buffer(`\n### ${title}`);
  for (let i = 0; i < files.length; i++) {
    const content = files[i];
    if ("" === content) {
      continue;
    }
    console.log(`change: ${content}`);
    let __buf = new Buffer(`\n> ${content}  `);
    buf = Buffer.concat([buf, __buf], buf.length + __buf.length);
  }

  return buf;
};

/**
 * 生成变更列表
 *
 * @param  {Array} files 各种状态的文件映射hash表
 * @return {String}      变更列表内容
 */
const generatorChangList = fileList => {
  const [modifyFileContent, newFileContent, deleteFileContent] = [generatorFilesList("new files", fileList.get("new files")),
    generatorFilesList("modify files", fileList.get("modify files")), generatorFilesList("delete files", fileList.get("delete files"))];
  let buf = new Buffer(0);
  buf = Buffer.concat([modifyFileContent, newFileContent, deleteFileContent], modifyFileContent.length + newFileContent.length + deleteFileContent.length);
  return buf.toString();
};

/**
 * 生成要变更历史信息
 *
 * @param  {String} message 提交修改的信息
 * @param  {Array} fileList 各种状态的文件映射hash表
 * @return {Promise}
 */
const generatorHistoryMsg = (message, fileList) => new Promise((solve, reject) => {
  const promise = Promise.all([getGitUserInfo(), getBranchInfo()]);
  promise.then(baseInfo => {
    const [userInfoStr, branchInfo] = baseInfo;
    const userInfo = strToKeyValue(userInfoStr);
    solve(`
${get("version")} / ${getFormateTime()}
==================
commit by ${userInfo["user.name"]} (${userInfo["user.email"]})
  * ${branchInfo}: ${message}

${generatorChangList(fileList)}
`);
  }).catch(err => reject(err));
});

/**
 * 记录历史到History.md文件中，如果History.md文件不存在则会在项目根目录创建一个
 *
 * @param  {String} message 提交修改的信息
 * @return {Promise}
 */
const recordHistory = message => {
  // file, data[, options], callback
  const historyFile = resolve(module[ROOT], "History.md");
  if (!existsSync(historyFile)) {
    createFile(historyFile, {});
    return recordHistory(message);
  }

  return new Promise((solve, reject) => {
    appendFile(historyFile, message, err => {
      if (err) {
        reject(err);
        return ;
      }
      console.log("[SUCCESS] append change logs in History.md done.");
      solve();
    });
  });
};

/**
 * 获取此次变更的所有状态的文件
 *
 * @return {Promise}
 */
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

/**
 * 构建项目
 *
 * @return {Promise}
 */
const structureProject = () => new Promise((solve, reject) => {
  const make = spawn("make", [], {
    cwd: module[ROOT],
  });

  let buf = new Buffer(0);
  make.stdout.on("data", chunk => buf = Buffer.concat([buf, chunk], buf.length + chunk.length));
  make.on("error", err => reject(err));
  make.on("close", code => {
    if (0 !== code) {
      reject({
        message: buf.toString(),
      });
      console.log("make is Failed.");
      return ;
    }
    solve();
  });
});

/**
 * cynomy push 操作， 提交git下变更内容，并写入到History.md文件中，最后推送到远程服务器
 *
 * @param  {String} message 提交修改的信息[非必需]
 * @param  {String} remote 指定远程地址代理名[非必需]
 * @param  {String} branch 指定提交分支名[非必需]
 */
module.exports = ({message, branch, remote, structure, not}) => {
  module[ROOT] = findRoot(process.env.PWD);
  if (!module[ROOT]) {
    console.log("Can't find project root! please sure this is cynomy project! or you can run cynomy install to create a cynomy project");
    return ;
  }

  if (!message) {
    message = `${new Date().toLocaleString()} commit change.`;
  }

  co(function* () {
    // 检测check参数,如果参数存在则先强制构建再提交
    if (structure) {
      console.log("begin structure project.");
      yield structureProject();
    }
    // 显示所有修改或要处理的文件列表
    const fileList = yield getChangFiles();
    // 写入history.md文件记录历史
    console.log("generator change log ...");
    const log = yield generatorHistoryMsg(message, fileList);
    yield recordHistory(log);
    // git add --a
    console.log("try to commite change ...");
    yield addFiles();
    // git commit -m
    yield commitChange(message);
    if (not) {
      console.log("close auto push commits to remote servers ...");
      return ;
    }
    // git push 功能
    console.log("begin to push commits to remote servers ...");
    return yield pushChange(remote, branch);
  }).then(() => {
    console.log(`[SUCCESS] ${getFormateTime()} push change success!`);
  }).catch(err => {
    console.log(err.message);
    console.log("push change failed! use git push by you own or try again.");
  });
};
