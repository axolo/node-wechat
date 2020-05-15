'use strict';

const WechatSdk = require('../src');

const { appId, appSecret } = process.env;
const config = { appId, appSecret };
const wechat = new WechatSdk(config);

const code = '001yrQvL1Ve7j91C4FvL1CbNvL1yrQv1';

wechat.code2token({ code }).then(res => {
  console.log(res);
});
