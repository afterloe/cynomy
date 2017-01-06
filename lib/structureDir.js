/**
  * afterloe - cynomy/lib/structureDir.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
  * Date:
  *   2017-1-6 10:40:29
  */
"use strict";

const [{mkdir, existsSync}, {resolve}] = [require("fs"), require("path")];
const ROOT = Symbol("root");

module[ROOT] = process.env.PWD; // 默认构建目录

/**
 * 异步构建文件夹
 *
 * @param  {String} dir 文件夹名
 * @return {Promise}
 */
const structureDir = dir => new Promise((solve, reject) => {
    const path = resolve(module[ROOT], dir);
    if (existsSync(path)) {
        console.log(`dir: ${dir} is exist.`);
        solve();
    }

    mkdir(path, err => {
        if (err) {
            console.log(`mkdir ${dir} ... FAILED!`);
            return reject(err);
        }
        console.log(`mkdir ${dir} ... SUCCESS!`);
        solve();
    });
});

/**
 * 设置ROOT目录
 *
 * @param {String} root   构建目标根目录
 */
const setRoot = root => module[ROOT] = root;

module.exports = {
    setRoot,
    structureDir,
};
