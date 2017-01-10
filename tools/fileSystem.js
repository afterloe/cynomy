/**
  * afterloe - cynomy/tools/fileSystem.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
  * Date:
  *   2017-1-7 14:01:14
  */
"use strict";

const [{readdirSync, readFileSync, createReadStream, createWriteStream}, {resolve, basename}, {notDeepStrictEqual}] = [require("fs"), require("path"), require("assert")];

/**
 * 读取客制化数据
 *
 * @param  {String} __path 客制化文件存放位置
 * @return {Object}        key-value 数据
 */
const readIndividualization = __path => {
    try {
        const buf = readFileSync(resolve(__path, ".cynomy"));
        return JSON.parse(buf.toString());
    } catch (error) {
        return {};
    }
};

/**
 * 查找用户自定义扩展
 *
 * @param  {String}  rootPath 需要查找的路径
 * @param  {Boolean} isFinal  是否继续递归
 * @return {String}           扩展配置文件的路径
 */
const findUserIndividualization = __path => {
    const [individualization, globale, project] = [{}, readIndividualization(process.env.HOME), readIndividualization(__path)];
    Object.assign(individualization, globale, project);
    notDeepStrictEqual(individualization, {}, "configuration file is not fount in this project or you home");
    return individualization;
};

/**
 * 查询hooks文件所在文件夹
 *
 * @param  {String} __path 初始文件夹目录
 * @param  {Array[Strint]} hooks  要查询的文件名
 * @return {String | undefined}        存在所有hooks文件的目录，不存在则返回undefinde
 */
const findRoot = (__path, ...hooks) => {
    const [slef, parentPath] = [this, resolve(__path, "..")];
    if (__path === parentPath) {
        return;
    }
    const [files, flagList] = [readdirSync(__path), []];
    for (let i = 0; i < files.length; i++) {
        for(let j = 0; j < hooks.length; j++) {
          if (hooks[j] === files[i]) {
              flagList.push(true);
          }
        }
    }
    const flag = flagList.length === hooks.length;
    hooks.unshift(parentPath);
    return flag ? __path : findRoot.apply(slef, hooks);
};

/**
 * 复制文件
 *
 * @param  {String} targrt  复制的目标
 * @param  {String} root    项目根路径
 * @return {Promise}
 */
const cp = (source, target) => new Promise((solve, reject) => {
  const name = basename(source);
  const targetPath = resolve(target, name);
  const [sourceStream, targetStream] = [createReadStream(source), createWriteStream(targetPath)];
  sourceStream.pipe(targetStream);

  targetStream.on("error", err => {
      console.log(`create file ${target} ... FAILED! `);
      reject(err);
  });

  sourceStream.on("error", err => {
    console.log(`read file ${source} ... FAILED! `);
    reject(err);
  });

  sourceStream.on("close", () => {
    console.log(`cp file to ${targetPath} ... SUCCESS! `);
    solve();
  });
});

module.exports = {
  findRoot,
  findUserIndividualization,
  cp,
};
