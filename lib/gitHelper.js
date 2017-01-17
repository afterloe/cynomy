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
const [createFile, {strToKeyValue, getFormateTime}, {get, setIndividualization}, {addFiles, commitChange, getBranchInfo, gitStatus, getGitUserInfo, pushChange}, {findRoot, findUserIndividualization}] = [require(resolve(__dirname, "createFile")), require(resolve(__dirname, "..", "tools", "currency")), require(resolve(__dirname, "..", "config")), require(resolve(__dirname, "..", "tools", "gitExtends")), require(resolve(__dirname, "..", "tools", "fileSystem"))];
const [ROOT, FILES] = [Symbol("ROOT"), Symbol("FILES")];

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
  let buf = new Buffer(`### ${title}\n`);
  for (let i = 0; i < files.length; i++) {
    const content = files[i];
    if ("" === content) {
      continue;
    }
    console.log(`change: ${content}`);
    let __buf = new Buffer(`> ${content}  \n`);
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
    solve(buf.toString());
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
  module[ROOT] = findRoot(process.env.PWD, "package.json"); // 读取当前用户的工作目录
  if (!module[ROOT]) {
    console.log("Can't find project root! please sure this is cynomy project! or you can run cynomy install to create a cynomy project");
    return ;
  }
  module[FILES] = readdirSync(module[ROOT]); // 设置文件内容
  if (!message) {
    message = `${new Date().toLocaleString()} commit change.`;
  }

  co(function* () {
    // 检测check参数,如果参数存在则先强制构建再提交
    if (structure) {
      console.log("begin structure project.");
      const structureLog = yield structureProject();
      console.log(structureLog);
    }
	// 设置用户客制化信息
	setIndividualization(findUserIndividualization(module[ROOT]));
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
