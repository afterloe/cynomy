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

configRoule.set("version", pkg.version);

const get = key => configRoule.has(key)? configRoule.get(key) : null;

module.exports = {
	get,
};
