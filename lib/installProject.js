/**
  * afterloe - cynomy/lib/installProject.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
  * Date:
  *   2017-1-5 15:11:33
  */
"use strict";

const [{resolve, basename}, {existsSync, writeFileSync, readdirSync, readFileSync}] = [require("path"), require("fs")];

let fileList;

/**
 * 自动补全文件
 *
 * @return {[type]} [description]
 */
const autoComplateFile = () => {
    const [] = [];
};

/**
 * 判读文件夹是否是基础环境
 *
 * @param  {String}  __path 脚本运行路径
 * @return {Boolean}        是否是基础环境
 */
const isBaseEvn = __path => {
    const files = readdirSync(__path);
    for (let i = 0; i < files.length; i++) {
        if ("package.json" === files[i]) {
            fileList = files;
            return false;
        }
    }

    return true;
};

module.exports = ({frame}) => {
    const runtimePath = process.env.PWD;
    if (isBaseEvn(runtimePath)) {
        console.log(`can't find package.json in ${runtimePath}, please run npm init first`);
        return ;
    }
};
