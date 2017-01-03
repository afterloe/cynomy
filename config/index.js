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

configRoule.set("author", cfg.author);
configRoule.set("licensed", cfg.licensed);
configRoule.set("mail", cfg.mail);
configRoule.set("homePage", cfg.homePage);
configRoule.set("version", pkg.version);

const get = key => configRoule.has(key)? configRoule.get(key) : null;

module.exports = {
	get,
};
