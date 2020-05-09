'use strict';

const WechatSdkCache = require('../src/cache');

const config = { store: 'memory', prefix: 'wechat' };
const cache = new WechatSdkCache(config);
const key = [ config.prefix, 'test' ].join('.');

cache.set(key, Date.now()).then(res => {
  console.log('cache.set:', res);
  cache.get(key).then(res => {
    console.log('cache.get:', { [key]: res });
  });
});
