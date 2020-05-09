'use strict';

const WechatSdk = require('../src');

const { appId, appSecret } = process.env;
const config = { appId, appSecret };
const wechat = new WechatSdk(config);

const jsCode = '011DgmJk07kanp1PVHMk0RhFJk0DgmJd';

wechat.code2session({ jsCode }).then(res => {
  console.log(res);
});
