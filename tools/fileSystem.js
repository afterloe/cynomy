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

const [{readdirSync}, {resolve}] = [require("fs"), require("path")];

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

module.exports = {
  findRoot,
};
