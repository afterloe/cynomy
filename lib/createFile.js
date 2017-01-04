/**
 * create by afterloe
 * MIT License
 *
 * bin/cynomy
 */
"use strict";

const [{resolve, basename}, {existsSync, writeFileSync, readdirSync}] = [require("path"), require("fs")];
const [{get}, {content}] = [require(resolve(__dirname, "..", "config")), require(resolve(__dirname, "content"))];

/**
 * 查询项目根目录
 *
 * @param  {[String]} __path [当前目录]
 * @return {[String]}        [项目根目录]
 */
const findProjectRoot = (__path) => {
    const parentPath = resolve(__path, "..");
    if (!existsSync(parentPath)) {
        return;
    }
    const file = readdirSync(__path);
    let flag = false;
    for (let i = 0; i < file.length; i++) {
        if ("package.json" === file[i]) {
            flag = true;
        }
    }

    return flag === true ? __path : findProjectRoot(parentPath);
};

/**
 * 构建项目相对路径
 * @param  {[String]} runtimePath [脚本运行时项目路径]
 * @param  {[String]} rootPath    [项目根目录]
 * @return {[String]}             [项目相对目录]
 */
const buildRelativePath = (runtimePath, rootPath) => {
    const [start, end] = [
        runtimePath.indexOf(basename(rootPath)),
        runtimePath.length
    ];
    return runtimePath.substring(start, end);
};

/**
 * 创建文件
 *
 * @param  {String} [file="index.js"] [需要创建的文件]
 * @param  {[String]} options           [选项]
 * @return {[null]}                   []
 */
module.exports = (file, ...options) => {
    const runtimePath = process.env.PWD;
    const [fullName, root] = [
        resolve(runtimePath, file),
        findProjectRoot(runtimePath)
    ];
    if (!root) {
        console.log("can't find root of this project!");
        return;
    }
    if (existsSync(fullName)) {
        console.log("file is exist");
        return;
    }
    const buf = content(file, buildRelativePath(fullName, root));
    if (!buf) {
        console.log("file type not supported");
        return;
    }
    writeFileSync(fullName, buf);
};
