/**
 * create by afterloe
 * MIT License
 *
 * bin/cynomy
 */
"use strict";

const [{resolve, basename}, {existsSync, writeFileSync}] = [require("path"), require("fs")];
const [{content}, {setIndividualization}, {findRoot, findUserIndividualization}] = [require(resolve(__dirname, "content")), require(resolve(__dirname, "..", "config")), require(resolve(__dirname, "..", "tools", "fileSystem"))];

/**
 * 构建项目相对路径
 *
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
module.exports = (file, options) => {
    const runtimePath = process.env.PWD;    // 获取脚本的运行路径
    const [fullName, root] = [
        resolve(runtimePath, file),
        findRoot(runtimePath, "package.json")
    ]; // 构建文件根目录，查找项目根目录
    if (!root) {
        console.log("can't find root of this project!");
        return;
    }
    if (existsSync(fullName)) {
        console.log(`file: ${file} is exist.`);
        return;
    }

    setIndividualization(findUserIndividualization(root)); // 设置用户客制化配置
    const buf = content(file, buildRelativePath(fullName, root), options); // 获取对应类型文件模版

    if (!buf) {
        console.log("file type not supported");
        return;
    }
    writeFileSync(fullName, buf);
};
