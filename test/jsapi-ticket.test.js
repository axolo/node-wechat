'use strict';

const WechatSdk = require('../src');

const { appId, appSecret } = process.env;
const config = { appId, appSecret };
const wechat = new WechatSdk(config);

wechat.getJsapiTicket().then(res => {
  const { cache } = wechat.config;
  const key = [ cache.prefix, 'jsapiTicket', wechat.config.appId ].join('.');
  console.log('SET:', key, res);
  wechat.cache.get(key).then(res => console.log('GET:', key, res));
});
