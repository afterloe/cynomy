/**
  * afterloe - cynomy/tools/currency.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
  * Date:
  *   2017-1-8 11:57:44
  */
"use strict";

/**
 * 键值对转化为JSON对象
 *
 * @param  {String} keyValue 简直对字符串
 * @return {JSON}            健值对对象
 */
const keyValueToJSON = keyValue => {
    keyValue = keyValue.split("=");
    return keyValue.length < 2 ? {} : {
        [keyValue[0]]: keyValue[1]
    };
};

/**
 * 将大片的字符串转换为JSON对象
 *
 * @param  {String} str 以\n为行的健值对文本
 * @return {JSON}       文本转化的健值对对象
 */
const strToKeyValue = str => {
    const [arr, json] = [str.split("\n"), {}];
    for (let i = 0; i < arr.length; i++) {
        const obj = keyValueToJSON(arr[i]);
        Object.assign(json, obj);
    }

    return json;
};

/**
 * 格式化时间
 *
 * @param  {Date}   [date= new Date()]  [需要格式化的时间]
 * @return {String}                     [格式化后的时间]
 */
const getFormateTime = (date = new Date()) => {
    const [yyyy, MM, dd, hh, mm, ss] = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(),
      date.getMinutes(), date.getSeconds()];
    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
};

module.exports = {
    strToKeyValue,
    getFormateTime,
};
