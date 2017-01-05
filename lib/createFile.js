/**
 * create by afterloe
 * MIT License
 *
 * bin/cynomy
 */
"use strict";

const [{resolve, basename}, {existsSync, writeFileSync, readdirSync, readFileSync}] = [require("path"), require("fs")];
const [{content}, {setIndividualization}] = [require(resolve(__dirname, "content")), require(resolve(__dirname, "..", "config"))];

/**
 * 读取客制化数据
 *
 * @param  {String} __path 客制化文件存放位置
 * @return {Object}        key-value 数据
 */
const readIndividualization = __path => {
    const buf = readFileSync(__path);
    try {
        return JSON.parse(buf.toString());
    } catch (error) {
        console.log(error);
        return {};
    }
};

/**
 * 查找拓展文件
 *
 * @param  {String}  __path 需要查找的路径
 * @return {String} 拓展文件的路径
 */
const findIndividualization = __path => {
  const files = readdirSync(__path);
  for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (".cynomy" === file) {
          return resolve(__path, file);
      }
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
    let individualizationPath = findIndividualization(__path);
    if (!individualizationPath) {
        individualizationPath = findIndividualization(process.env.HOME);
    }

    if (individualizationPath) {
        return readIndividualization(individualizationPath);
    } else {
        console.log("configuration file is not fount in this project or you home");
    }

    return {};
};

/**
 * 查询项目根目录
 *
 * @param  {[String]} __path [当前目录]
 * @return {[String]}        [项目根目录]
 */
const findProjectRoot = __path => {
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
        findProjectRoot(runtimePath)
    ]; // 构建文件根目录，查找项目根目录
    if (!root) {
        console.log("can't find root of this project!");
        return;
    }
    if (existsSync(fullName)) {
        console.log("file is exist");
        return;
    }

    setIndividualization(findUserIndividualization(root)); // 设置用户客制化配置
    const buf = content(file, buildRelativePath(fullName, root), options); // 获取对应类型文件模版
    console.log(buf);
    if (!buf) {
        console.log("file type not supported");
        return;
    }
    writeFileSync(fullName, buf);
};
