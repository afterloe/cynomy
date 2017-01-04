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
const [configRoule, pkg, cfg] = [new Map(), require(resolve(__dirname, "..", "package")), require(resolve(__dirname, "..", "configuration.json"))];

configRoule.set("author", cfg.author); // 设置作者信息
configRoule.set("licensed", cfg.licensed); // 设置开源协议信息
configRoule.set("mail", cfg.mail); // 设置邮件信息
configRoule.set("homePage", cfg.homePage); // 设置首页信息
configRoule.set("version", pkg.version); // 设置版本信息

const get = key => configRoule.has(key)? configRoule.get(key) : null;

module.exports = {
	get,
};
