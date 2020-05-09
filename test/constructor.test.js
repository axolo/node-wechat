'use strict';

const WechatSdk = require('../src');

const { appId, appSecret } = process.env;
const config = { appId, appSecret };
const wechatSdk = new WechatSdk(config);

console.log(wechatSdk);
