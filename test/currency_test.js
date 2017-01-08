/**
  * afterloe - cynomy/test/currency_test.js
  *
  * Copyright(c) afterloe.
  * MIT Licensed
  *
  * Authors:
  *   afterloe <afterloeliu@jwis.cn> (https://github.com/afterloe)
  * Date:
  *   2017-1-8 15:46:11
  */
"use strict";

const [{resolve}, {deepEqual, equal}] = [require("path"), require("assert")];
const currency = require(resolve(__dirname, "..", "tools", "currency"));

/**
 * currency 功能测试
 */
describe("currency", () => {
  describe("#getFormateTime", () => {
    
    it("generator date string without any params", () => {
      currency.getFormateTime();
    });

    it("generator date string with fixed time", () => {
      const date = new Date();
      date.setFullYear(2012);
      date.setMonth(9);
      date.setDate(20);
      date.setHours(6);
      date.setMinutes(20);
      date.setSeconds(42);
      const dateStr = currency.getFormateTime(date);
      equal("2012-10-20 6:20:42", dateStr);
    });
  });

  describe("#strToKeyValue", () => {

    it("read str normal str", () => {
      const str = "user.name=afterloe\nuser.email=lm6289511@gmail.com";
      const json = currency.strToKeyValue(str);
      deepEqual({
        "user.name": "afterloe",
        "user.email": "lm6289511@gmail.com",
      }, json);
    });

    it("read str does not conform to the standard", () => {
      const str = "";
      const json = currency.strToKeyValue(str);
      deepEqual({}, json);
    });

    it("read str does not conform to the standard", () => {
      const str = "zcjzoxcnsoc20dj=323mksapd2-0c=2-9kkd";
      const json = currency.strToKeyValue(str);
      deepEqual({
        "zcjzoxcnsoc20dj": "323mksapd2-0c",
      }, json);
    });

    it("read str does not conform to the standard", () => {
      const str = "zcjzoxcnsoc20dj=323\nmksapd2-0c=2-9kkd\nsrer";
      const json = currency.strToKeyValue(str);
      deepEqual({
        "zcjzoxcnsoc20dj":"323",
        "mksapd2-0c":"2-9kkd",
      }, json);
    });
  });
});
