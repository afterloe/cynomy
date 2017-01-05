/**!
 * afterloe - config/index.js
 *
 * Copyright(c) afterloe.
 * MIT Licensed
 *
 * Authors:
 *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
 */
"use strict";

const {resolve} = require("path");
const [configRoule, pkg] = [new Map(), require(resolve(__dirname, "..", "package"))];

configRoule.set("version", pkg.version); // 设置版本信息

/**
 * 获取配置
 *
 * @param  {[String]} key [配置项]
 * @return {[String]}     [配置内容]
 */
const get = key => configRoule.has(key)? configRoule.get(key) : null;

/**
 * 设置客制化内容
 *
 * @param {[String]} author   [开发者]
 * @param {[String]} licensed [开源协议]
 * @param {[String]} mail     [开发者邮箱]
 * @param {[String]} homePage [开发者web页]
 */
const setIndividualization = ({author = process.env.LOGNAME, licensed = "", mail = "", homePage = ""}) => {
		configRoule.set("author", author); // 设置作者信息
		configRoule.set("licensed", licensed); // 设置开源协议信息
		configRoule.set("mail", mail); // 设置邮件信息
		configRoule.set("homePage", homePage); // 设置首页信息
};

module.exports = {
	get,
	setIndividualization,
};
